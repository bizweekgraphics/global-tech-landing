var places;

if("geolocation" in navigator) {
  function success(position) {
    latitude = position.coords.latitude
    longitude = position.coords.longitude
    var cookie = JSON.stringify({ "type": "Feature", "properties": {"city": "You", "story": "User Location"}, "geometry": { "type": "Point", "coordinates": [ longitude, latitude ] } })
    
    Cookies.set('location', cookie)
    places.features.push(JSON.parse(cookie))
    geoRefresh()
  }

  function error() {
    console.log('geolocation error')
  }

  navigator.geolocation.getCurrentPosition(success, error)
}


//modified from http://bl.ocks.org/dwtkns/4973620
d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var margin = {top: 0, right: 0, bottom: 0, left: 0};

var width = 630 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 3.5])
    .clipAngle(90)
    .rotate([104.9847, -39.7392, 0])
    .scale(220);

var sky = d3.geo.orthographic()
    .translate([width / 2, height / 3.5])
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

  if(Cookies.get('location')){
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
      .attr("d", path)
      .attr('id', function(d) {
        if(d.properties.city === "You") {
          return "you"
        }
      })




  svg.append("g").attr("class","labels")
    .selectAll(".label").data(places.features)
    .enter().append("text")
    .attr("class", "label")
    .text(function(d) { return d.properties.city })

  svg.append("path")
      .datum({type: "Sphere"})
      .attr("class", "sphere")
      .attr("d", path);

  svg.append('text')
    .text('TABLE OF CONTENTS')
    .attr('id', 'table-contents-text')
    .attr('y', 480)

  svg.append('rect')
    .attr('width', 630)
    .attr('height', 10)
    .attr('y', 490)

  svg.append('foreignObject')
    .data(places.features)
    .attr('class', 'city-arrow')
    .attr('width', 125)
    .attr('height', 100)
    .attr('y', 205)
    .attr('x', 185)
    .append('xhtml:img')


  var over = false
  var base = 460

  svg.append('g').attr('class', 'city-texts')
    .selectAll('.city-text').data(places.features)
    .enter().append('foreignObject')
    .attr('x', function(d) {
      var idx = places.features.indexOf(d)
      if(idx < 6) {
        return 0 
      } else if(idx >= 6 && idx < 11) {
        return 220
      } else {
        return 440        
      }
    })
    .attr('y', function(d) {
      var idx = places.features.indexOf(d)
      if(idx === 6 || idx === 11) {
        base = 460
      }
      if(idx > 0 && places.features[idx-1].properties.story.length > 21) {
        var multiplier = places.features[idx-1].properties.story.length / 21
        if(idx != 6 && idx !=11) {
          var add = 7 * multiplier
          base += add      
        }
      }
      base += 60
      return base
    })
    .attr('width', 200)
    .attr('height', 200)
    .append('xhtml:p')
    .attr('class', 'city-text')
    .text(function(d) { 
      if(d.properties.story != "User Location"){
        return d.properties.story 
      }
    })
    .on('mouseover', function(d) {
      $(this).css('opacity', .5)
      over = true
      var coordinates = d.geometry.coordinates
      d3.transition()
        .each('end', function() {
          if(over === true) {
            $('.city-arrow img').attr('src', 'img/' + d.properties.img)
            setImgY(d)
            $('.city-arrow').show()
          }
        })
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
    .on('mouseout', function() {
      $(this).css('opacity', 1)
      over = false
      $('.city-arrow').hide()
    })
    .on('click', function(d) {
      d = JSON.stringify(d)
      addCookie(d)
      console.log(Cookies.get('seen'))
    })

  $('.city-text').hover(function() {
    $(this).css('color', 'rgba(0,0,0,.5)')
  })

  var setImgY = function(d) {
    var city = d.properties.city
    var y;
    switch(city) {
      case "Beijing":
        y = 217
        break;
      case "Beirut":
        y = 217
        break;
      case "Helsinki":
        y = 222
        break;
      case "Nairobi":
        y = 220
        break;
      case "Lyon":
        y = 207
        break;
      case "London":
        y = 219
        break;
      case "Reykjavik":
        y = 225
        break;
      case "Rio de Janeiro":
        y = 234
        break;
      case "Cambridge, MA":
        y = 236
        break;
      case "Miami Beach, FL":
        y = 229
        break;
      case "Denver, CO":
        y = 218;
        break;
      case "Black Rock City, NV":
        y = 237;
        break;
      case "Phoenix, AZ":
        y = 220;
        break;
      case "Vandenberg AFB":
        y = 236
        break;
      case "DMZ":
        y = 236
        break;
      case "Silicon Valley":
        y = 233
        break;
      default: 
        y = 255
        break;
    }
    console.log(y)
    $('.city-arrow').attr('y', y)
  }


  var addCookie = function(story) {
    if(Cookies.get('seen')) {
      var cookies = Cookies.get('seen')
      Cookies.set('seen', cookies + '|' + story)  
    } else {
      Cookies.set('seen', story)
    }
  }

  if(Cookies.get('seen')) {
    createLinks()
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

var createLinks = function() {
  if(Cookies.get('location')) {
    var seenArray = (Cookies.get('location') + '|' + Cookies.get('seen')).split('|')
  } else {
    var seenArray = Cookies.get('seen').split('|')
  }
  seenArray.forEach(function(feature, index) {
    if(index < (seenArray.length - 1) && Cookies.get('seen')){
      var sourceObj = JSON.parse(feature)
      var targetObj = JSON.parse(seenArray[index + 1])
      if(JSON.stringify(sourceObj) != JSON.stringify(targetObj)){
        links.push({
          source: sourceObj.geometry.coordinates,  
          target: targetObj.geometry.coordinates
        })
      }
    }
  })
}

var geoRefresh = function() {
  links = []
  arcLines = []
  
  createLinks()

  links.forEach(function(e,i,a) {
    var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [e.source,e.target] }}
    arcLines.push(feature)
  })

  d3.select('.points')
  .selectAll(".point").data(places.features)
  .enter().append("path")
  .attr("class", "point")
  .attr("d", path)
  .attr('id', function(d) {
    if(d.properties.city === "You") {
      return "you"
    }
  })

  d3.select('.labels')
    .selectAll('.label')
    .data(places.features)
    .enter().append("text")
    .attr("class", "label")
    .text(function(d) { return d.properties.city })

  d3.select('.arcs')
    .selectAll('.arc').data(arcLines)
    .enter().append('path')
    .attr('class', 'arc')
    .attr('d', path)

  d3.select('.flyers')
    .selectAll('.flyer').data(links)
    .enter().append('path')
    .attr('class', 'flyer')
    .attr('d', function(d) { return swoosh(flying_arc(d))})

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


