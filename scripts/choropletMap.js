// The svg
const svg = d3.select("#first-view");
const boundingRect = svg.node().getBoundingClientRect();
const width = boundingRect.width;
const height = boundingRect.height;
const viewBoxWidth = width + 300;
const viewBoxHeight = height + 300;

async function drawLegend(colorScale) {
  const defs = svg.append("defs")
  
  const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
  
  linearGradient.selectAll("stop")
    .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
    .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    
  linearGradient.attr("gradientTransform", `rotate(-90), translate(-1, 0)`);
  
  svg.append("g")
  .append("rect")
    .attr("class", "choro-legend")
	  .style("fill", "url(#linear-gradient)")
}

async function drawChoro(sales, colorPalette) {
  let geo = await d3.json("./dataset/geo_cleaned.geojson");
    
  let data = new Map();
  // keys = sales[0].keys();
  continents = ["NA", "EU", "JP", "Other"];
  
  sales.forEach(d => {
    for (let i = 0; i < continents.length; i++) {
      let continent = continents[i];
      if (!data.has(continent)) {
        data.set(continent, 0);
      }
      let curr_sales = data.get(continent);
      let new_sales = parseFloat(d[continent+"_Sales"]);
      data.set(continent, curr_sales + new_sales);
    }
  });

  let colorScale = d3.scaleSequential(colorPalette)
    .domain([0, d3.max(data.values())]);

  // Map and projection
  let projection = d3.geoMercator()
    // .scale(width/(Math.PI*2)*0.9*0.7)
    // .center([0, 20])
    .translate([width, height]);

  let onclick = function (d) {
    let element = d3.select(this);
    element.classed("highlighted", !element.classed("highlighted"));
    // TODO: add the country to the list of selected countries and update the second view
  };


  projection.fitSize([width, height], {type:"FeatureCollection", features: geo.features});
  // Draw the map
  svg.attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
    .append("g")
    // center the map in the svg
    .attr("transform", "translate(" + (viewBoxWidth - width) / 2 + "," + (viewBoxHeight - height) / 2 + ")")
    .selectAll("path")
    .data(geo.features)
    .join("path")
    // draw each country
    .attr("class", "country")
    .attr("d", d3.geoPath()
      .projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      continent = d.properties.continent
      d.total = data.get(continent) || 0;

      console.log(continent);
      console.log(d.total);
      
      return colorScale(d.total);
    });
    
    
  d3.selectAll(".country")
    .on("click", onclick);

  drawLegend(colorScale);
};