var urlArray = ["http://www.businessweek.com/articles/2014-06-04/chinas-xiaomi-the-worlds-fastest-growing-phone-maker", "http://www.businessweek.com/articles/2014-06-05/clash-of-clans-maker-supercell-succeeds-nokia-as-finlands-tech-power", "http://www.businessweek.com/articles/2014-06-05/tech-savvy-hezbollah-goes-multiplatform-to-spread-its-message", "http://www.businessweek.com/articles/2014-06-05/safaricoms-m-pesa-turns-kenya-into-a-mobile-payment-paradise", "http://www.businessweek.com/articles/2014-06-05/babolat-tennis-rackets-sensors-measure-swing-speed-strength", "http://www.businessweek.com/articles/2014-06-05/londons-massive-subway-tunneling-machines-build-as-they-destroy", "http://www.businessweek.com/articles/2014-06-05/eve-onlines-nerd-monument-vandalized-over-in-game-rivalry", "http://www.businessweek.com/articles/2014-06-05/how-major-league-baseball-helps-espn-stream-world-cup-soccer", "http://www.businessweek.com/articles/2014-06-05/transatomic-powers-safer-reactor-eats-nuclear-waste", "http://www.businessweek.com/articles/2014-06-05/infiltrate-conference-draws-hackers-spies-to-miami-beach", "http://www.businessweek.com/articles/2014-06-05/is-chris-dancy-the-most-quantified-self-in-america", "http://www.businessweek.com/articles/2014-06-05/founded-by-army-vet-tankchair-makes-all-terrain-wheelchairs", "http://www.businessweek.com/articles/2014-06-05/digitalglobes-new-satellite-can-see-everything-from-383-miles-away", "http://www.businessweek.com/articles/2014-06-05/how-to-build-a-new-gadget-in-seven-steps", "http://www.businessweek.com/articles/2014-06-05/the-no-tech-tactics-of-north-koreas-target-zero-park-sang-hak", "http://www.businessweek.com/articles/2014-06-05/tech-immigrants-a-map-of-silicon-valleys-imported-talent"]

var thisUrl;

if(urlArray.indexOf(window.top.location.href) != -1) {
  thisUrl = window.top.location.href
} else if (urlArray.indexOf(document.referrer) != -1) {
  thisUrl = document.referrer
} else {
  thisUrl = _.shuffle(urlArray)[0]  
}

var thisStory

var addCookie = function(story) {
  if(Cookies.get('seen')) {
    var cookies = Cookies.get('seen')
    var cookieArray = cookies.split('|')
    var lastCookie = cookieArray[cookieArray.length - 1]
    if(urlArray.indexOf(story) != -1 && story != lastCookie) {
      Cookies.set('seen', cookies + '|' + story)  
    }
  } else {
    if(story && urlArray.indexOf(story) != -1) {
      Cookies.set('seen', story)
    }
  }
  rotateTransition()
  // geoRefresh()
}

var setCookie = function() {
  thisStory = _.find(places.features, function(feature) {
    return feature.properties.url === thisUrl
  })
  thisStoryIdx = places.features.indexOf(thisStory)
  nextStory = places.features[thisStoryIdx + 1]

  if(!nextStory) {
    nextStory = places.features[0]
  }

  // var cookie = JSON.stringify(thisStory)
  var cookie = thisUrl
  addCookie(cookie)
} 

var cookiesToJson = function() {
  var cookieArray = []
  var cookies = Cookies.get('seen').split('|')
  cookies.forEach(function(cookie) {
    var obj = _.find(places.features, function(feature) {
      return feature.properties.url === cookie
    })
    cookieArray.push(obj)
  })
  return cookieArray
}

var rotateTransition = function() {
    d3.transition()
      .each('end', function() {
        $('svg img').remove()

        $('.next-story').remove()

        svg.selectAll('.next-story')
          .data([nextStory])
          .enter().append('foreignObject')
          .attr('width', 400)
          .attr('height', 250)
          .attr('x', 22)
          .attr('y', 50)
          .attr('class', 'next-story')
          .append('xhtml:p')
          .on('click', function(d) {
            window.top.location.href = d.properties.url
          })
          .text(function(d) {
            return d.properties.story
          })


        svg.append('foreignObject')
          .data([thisStory])
          .attr('class', 'city-arrow')
          .attr('width', 125)
          .attr('height', 100)
          .attr('y', 60)
          .attr('x', 515)
          .append('xhtml:img')
          
        $('.city-arrow img').attr('src', 'img/' + nextStory.properties.img)
        setImgY(nextStory)
        $('.city-arrow').show()
      })
      .duration(750)
      .tween("rotate", function() {
        var r = d3.interpolate(proj.rotate(), [-nextStory.geometry.coordinates[0], -nextStory.geometry.coordinates[1]]);
        return function(t) {
          proj.rotate(r(t));
          sky.rotate(r(t))
          svg.selectAll("path").attr("d", path);
          refresh()
        }
      })
  geoRefresh()
}
  var offset = 144

  var setImgY = function(d) {
    var city = d.properties.city
    var y;
    switch(city) {
      case "Beijing":
        y = 217 - offset
        break;
      case "Beirut":
        y = 217 - offset
        break;
      case "Helsinki":
        y = 222 - offset
        break;
      case "Nairobi":
        y = 220 - offset
        break;
      case "Lyon":
        y = 207 - offset
        break;
      case "London":
        y = 219 - offset
        break;
      case "Reykjavik":
        y = 225 - offset
        break;
      case "Rio de Janeiro":
        y = 234 - offset
        break;
      case "Cambridge, MA":
        y = 236 - offset
        break;
      case "Miami Beach, FL":
        y = 229 - offset
        break;
      case "Denver, CO":
        y = 218 - offset
        break;
      case "Black Rock City, NV":
        y = 237 - offset
        break;
      case "Phoenix, AZ":
        y = 220 - offset
        break;
      case "Vandenberg AFB":
        y = 236 - offset
        break;
      case "DMZ":
        y = 236 - offset
        break;
      case "Silicon Valley":
        y = 233 - offset
        break;
      default: 
        y = 255 - offset
        break;
    }
    $('.city-arrow').attr('y', y)
  }

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
    geoRefresh()
  }

  navigator.geolocation.getCurrentPosition(success, error)
}


//modified from http://bl.ocks.org/dwtkns/4973620
d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var margin = {top: 0, right: 0, bottom: 0, left: 0};

var width = 970 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var proj = d3.geo.orthographic()
    .translate([width / 1.5, height / 2.2])
    .clipAngle(90)
    .rotate([104.9847, -39.7392, 0])
    .scale(180);

var sky = d3.geo.orthographic()
    .translate([width / 1.5, height / 2.2])
    .clipAngle(90)
    .rotate([104.9847, -39.7392, 0])
    .scale(270);

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

  setCookie()

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

  svg.append('foreignObject')
    .data([thisStory])
    .attr('class', 'city-arrow')
    .attr('width', 125)
    .attr('height', 100)
    .attr('y', 60)
    .attr('x', 300)
    .append('xhtml:img')

  svg.append('text')
    .attr('id', 'next-destination')
    .attr('x', 22)
    .attr('y', 40)
    .text('NEXT DESTINATION:')

  svg.append('foreignObject')
    .attr('height', 30)
    .attr('width', 300)
    .attr('x', 22)
    .attr('y', 220)
    .append('xhtml:p')
    .on('click', function(d) {
      window.top.location.href = 'http://www.businessweek.com/features/the-global-technology-issue-way-beyond-silicon-valley'
    })
    .attr('id', 'global-tech')
    .text('*Discover More #GlobalTech Content*')

    svg.selectAll('.next-story')
      .data([nextStory])
      .enter().append('foreignObject')
      .attr('width', 400)
      .attr('height', 250)
      .attr('x', 22)
      .attr('y', 50)
      .attr('class', 'next-story')
      .append('xhtml:p')
      .on('click', function(d) {
        window.top.location.href = d.properties.url
      })
      .text(function(d) {
        return d.properties.story
      })

  svg.append('rect')
    .attr('width', 970)
    .attr('height', 250)
    .style('stroke', 'black')
    .style('fill', 'none')
    .style('stroke-width', '.5em')

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
    var locationArray = [JSON.parse(Cookies.get('location'))]
    var seenArray = locationArray.concat(cookiesToJson())
  } else {
    var seenArray = cookiesToJson()
  }
  seenArray.forEach(function(feature, index) {
    if(index < (seenArray.length - 1) && Cookies.get('seen')){
      var sourceObj = feature
      var targetObj = seenArray[index + 1]
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
  $('.city-arrow').hide()
  
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



