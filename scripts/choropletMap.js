// The svg
const svg = d3.select("#first-view");
const boundingRect = svg.node().getBoundingClientRect();
const width = boundingRect.width;
const height = boundingRect.height;

console.log(width, height);
console.log(width / height);

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  // .scale(width/(Math.PI*2)*0.9*0.7)
  // .center([0, 20])
  .translate([width / 2, height / 2]);


// Data and color scale
let data = new Map()
const colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeGreens[7]);

// Load external data and boot
Promise.all([
  d3.json("./dataset/geo_cleaned.geojson"),
  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", 
  function (d) {
    data.set(d.code, d.pop)
  })])
  .then(function (loadData) {
    let topo = loadData[0]
    projection.fitSize([width, height], {type:"FeatureCollection", features: topo.features});
    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      // draw each country
      .attr("class", "country")
      .attr("d", d3.geoPath()
        .projection(projection))
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      });
  });
svg.attr("transform", "scale(" + height/width + ", 1)")