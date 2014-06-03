var places;
var userGeo = false  

if("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(success, error)

  function success(position) {
    latitude = position.coords.latitude
    longitude = position.coords.longitude
    var cookie = JSON.stringify({ "type": "Feature", "properties": {"city": "You", "story": "User Location"}, "geometry": { "type": "Point", "coordinates": [ longitude, latitude ] } })
    Cookies.set('location', cookie)
    userGeo = true
    places.features.push(JSON.parse(cookie))
    geoRefresh()
  }

  function error() {
    console.log('geolocation error')
  }
}


//modified from http://bl.ocks.org/dwtkns/4973620
d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var margin = {top: 0, right: 0, bottom: 0, left: 0};

var width = 970 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([104.9847, -39.7392, 0])
    .scale(220);

var sky = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([104.9847, -39.7392, 0])
    .scale(300);

var path = d3.geo.path().projection(proj).pointRadius(2);

var graticule = d3.geo.graticule()
  .step([36, 25])


var swoosh = d3.svg.line()
      .x(function(d) { return d[0] })
      .y(function(d) { return d[1] })
      .interpolate("cardinal")
      .tension(.0);

var links = [],
    arcLines = [];

var svg = d3.select("#globe").append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("mousedown", mousedown);

queue()
    .defer(d3.json, "js/world-110m.json")
    .defer(d3.json, "js/places.json")
    .await(ready);

function ready(error, world, placesObj) {
  places = placesObj

  if(userGeo){
    places.features.push(JSON.parse(Cookies.get('location')))
  }

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule noclicks")
    .attr("d", path);


  svg.append('path')
    .datum(topojson.object(world, world.objects.countries))
    .attr('class', 'countries noclicks')
    .attr('d', path)
    .style('stroke', 'black')
    .style('fill', 'white')

  svg.append("g").attr("class","points")
      .selectAll("text").data(places.features)
    .enter().append("path")
      .attr("class", "point")
      .attr("d", path);



  svg.append("g").attr("class","labels")
    .selectAll("text").data(places.features)
    .enter().append("text")
    .attr("class", "label")
    .text(function(d) { return d.properties.city })

  svg.append("path")
      .datum({type: "Sphere"})
      .attr("class", "sphere")
      .attr("d", path);

  var base = 30
  svg.append('g').attr('class', 'city-texts')
    .selectAll('text').data(places.features)
    .enter().append('text')
    .attr('class', 'city-text')
    .attr('x', 50)
    .attr('y', function(d) {
      base += 30
      return base
    })
    .text(function(d) { return d.properties.story })
    .on('mouseover', function(d) {
      var coordinates = d.geometry.coordinates
      d3.transition()
        .duration(750)
        .tween("rotate", function() {
        var r = d3.interpolate(proj.rotate(), [-coordinates[0], -coordinates[1]]);
        return function(t) {
          proj.rotate(r(t));
          sky.rotate(r(t))
          svg.selectAll("path").attr("d", path);
          refresh()
        };
      })
    })
    .on('click', function(d) {
      addCookie(d.properties.story)
      console.log(Cookies.get('seen'))
    })

  var addCookie = function(story) {
    if(Cookies.get('seen')) {
      var cookies = Cookies.get('seen')
      Cookies.set('seen', cookies + ',' + story)  
    } else {
      Cookies.set('seen', story)
    }
  }

  if(Cookies.get('seen')) {
    var seenArray = Cookies.get('seen').split(',')
    seenArray.forEach(function(story, index) {

      if(index < (seenArray.length)){
        if(index === 0 && Cookies.get('location')) {
          var sourceObj = JSON.parse(Cookies.get('location'))
        } else {
          var sourceObj =_.find(places.features, function(place) {
            return place.properties.story === seenArray[index - 1]
          })
        }
        var targetObj = _.find(places.features, function(place) {
          return place.properties.story === story
        })
        if(sourceObj != targetObj){
          links.push({
            source: sourceObj.geometry.coordinates,  
            target: targetObj.geometry.coordinates
          })
        }
      }
    })
  }



  // build geoJSON features from links array
  links.forEach(function(e,i,a) {
    var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [e.source,e.target] }}
    arcLines.push(feature)
  })

  svg.append("g").attr("class","arcs")
    .selectAll("path").data(arcLines)
    .enter().append("path")
      .attr("class","arc")
      .attr("d",path)

  svg.append("g").attr("class","flyers")
    .selectAll("path").data(links)
    .enter().append("path")
    .attr("class","flyer")
    .attr("d", function(d) { return swoosh(flying_arc(d)) })

  positionLabels()
  refresh();
}

var geoRefresh = function() {
  d3.select('points')
  .selectAll(".point").data(places.features)
  .enter().append("path")
  .attr("class", "point")
  .attr("d", path);

  d3.select('.labels')
    .selectAll('.label')
    .data(places.features)
    .enter().append("text")
    .attr("class", "label")
    .text(function(d) { return d.properties.city })

  refresh()
}


function positionLabels() {
  var centerPos = proj.invert([width/2,height/2]);

  var arc = d3.geo.greatArc();

  svg.selectAll(".label")
    .attr("text-anchor",function(d) {
      var x = proj(d.geometry.coordinates)[0];
      return x < width/2-20 ? "end" :
             x < width/2+20 ? "middle" :
             "start"
    })
    .attr("transform", function(d) {
      var loc = proj(d.geometry.coordinates),
        x = loc[0],
        y = loc[1];
      var offset = x < width/2 ? -5 : 5;
      if(d.properties.city === "Parker, CO" || d.properties.city === "Parker, AZ") {
        return "translate(" + (x+offset) + "," + (y+5) + ")"
      } else {
        return "translate(" + (x+offset) + "," + (y-2) + ")"
      }
    })
    .style("display",function(d) {
      var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
      return (d > 1.57) ? 'none' : 'inline';
    })
    
}

function flying_arc(pts) {
  var source = pts.source,
      target = pts.target;

  var mid = location_along_arc(source, target, .5);
  var result = [ proj(source),
                 sky(mid),
                 proj(target) ]
  return result;
}



function refresh() {
 svg.selectAll(".graticule").attr("d", path);
  positionLabels()
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".point").attr("d", path);
  
  svg.selectAll(".arc").attr("d", path)
    .attr("opacity", function(d) {
        return fade_at_edge(d)
    })

  svg.selectAll(".flyer")
    .attr("d", function(d) { return swoosh(flying_arc(d)) })
    .attr("opacity", function(d) {
      return fade_at_edge(d)
    }) 
}

function fade_at_edge(d) {
  var centerPos = proj.invert([width/2,height/2]),
      arc = d3.geo.greatArc(),
      start, end;
  // function is called on 2 different data structures..
  if (d.source) {
    start = d.source, 
    end = d.target;  
  }
  else {
    start = d.geometry.coordinates[0];
    end = d.geometry.coordinates[1];
  }
  
  var start_dist = 1.57 - arc.distance({source: start, target: centerPos}),
      end_dist = 1.57 - arc.distance({source: end, target: centerPos});
    
  var fade = d3.scale.linear().domain([-.1,0]).range([0,.1]) 
  var dist = start_dist < end_dist ? start_dist : end_dist; 

  return fade(dist)
}

function location_along_arc(start, end, loc) {
  var interpolator = d3.geo.interpolate(start,end);
  return interpolator(loc)
}

// modified from http://bl.ocks.org/1392560
var m0, o0;
function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = proj.rotate();
  d3.event.preventDefault();
}
function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY]
      , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
    o1[1] = o1[1] > 30  ? 30  :
            o1[1] < -30 ? -30 :
            o1[1];
    proj.rotate(o1);
    sky.rotate(o1);
    svg.selectAll("path").attr("d", path);
    
    refresh();
  }
}
function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}



