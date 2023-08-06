// The svg
const svg = d3.select("#first-view");
const boundingRect = svg.node().getBoundingClientRect();
const width = boundingRect.width;
const height = boundingRect.height;
const viewBoxWidth = width;
const viewBoxHeight = height;

var selectedRegions = [];

const legendWidth = .02 * width;
const legendHeight = .25 * width;
const legendMargin = { top: height / width * 500, right: 0, bottom: 0, left: 20 };
const legendTicks = 5;
const legendTickSize = 5;

const legendTickFormat = (d) => { 
  if (d < 0.001)
    return d3.format(".2s")(d * 1000000) + " $";
  else if (d < 1)
    return d3.format(".2s")(d * 1000) + " K$";
  else if (d < 1000) 
    return d3.format(".2s")(d) + " M$";
  else
    return d3.format(".2s")(d / 1000) + " B$"; 
}



function tickAdjust(g) {
  return g.selectAll(".tick line").attr("x1", -legendWidth);
}

function ramp(color, n = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = n;
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(1 - i / (n - 1));
    context.fillRect(0, i, 1, 1);
  }
  return canvas;
}

function makeLegend({
  legend,
  color,
  tickSize = 6,
  width = 36 + tickSize,
  height = 320,
  marginTop = 20,
  marginRight = 10 + tickSize,
  marginBottom = 20,
  marginLeft = 5,
  ticks = height / 64,
  tickFormat,
  tickValues
} = {}) {


  legend.attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("x1", marginLeft - width + marginRight);

  // Sequential
  let x = Object.assign(color.copy().interpolator(d3.interpolateRound(height - marginBottom, marginTop)),
    { range() { return [height - marginBottom, marginTop]; } });

  legend.append("image")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .attr("preserveAspectRatio", "none")
    .attr("xlink:href", ramp(color.interpolator()).toDataURL());

  // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
  if (!x.ticks) {
    if (tickValues === undefined) {
      const n = Math.round(ticks + 1);
      tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
    }
    if (typeof tickFormat !== "function") {
      tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
    }
  }


  legend.append("g")
    .attr("transform", `translate(${width - marginRight},0)`)
    .attr("class", "choro-legend-axis")
    .call(d3.axisRight(x)
      .ticks(ticks, tickFormat)
      .tickFormat(tickFormat)
      .tickSize(tickSize)
      .tickValues(tickValues))
    .call(tickAdjust)
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
      .attr("x", marginLeft - width + marginRight)
      .attr("y", 0)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .attr("class", "text"));

  return legend.node();
}

function computeTotalSales(sales) {
  let choroData = new Map();

  for (let i = 0; i < regions.length; i++) {
    choroData.set(regions[i], 0);
  }

  // compute total sales for each region
  for (let i = 0; i < sales.length; i++) {
    let sale = sales[i];

    // iterate over regions
    for (let j = 0; j < regions.length; j++) {
      let region = regions[j];

      if (!choroData.has(region)) {
        choroData.set(region, 0);
      }

      let curr_sales = choroData.get(region);
      let new_sales = parseFloat(sale[region + "_Sales"]);

      choroData.set(region, curr_sales + new_sales);
    }
  }
  return choroData;
}

function computeColorScale(choroData) {
  const max = d3.max(choroData.values());

  return d3.scaleSequential(colorPalette)
    .domain([0, max <= 1 ? 1 : max]);
}

function addChoroTooltip() {
  let tooltip = d3.select("#dataviz")
    .append("div")
  tooltip
    .attr("id", "choro-tooltip")
    .classed("hidden", true)
    .classed("round-edge-with-shadow", true);
  
  tooltip
    .append("p")
    .append("span")
    .attr("id", "choro-category")
    .classed("text", true)
    .text("Region:");
    
  tooltip.append("p")
    .append("span")
    .attr("id", "choro-value")
    .classed("text", true)
    .text("Value: ");
}

async function updateTooltip(field, data, colorScale) {

  let value = data.get(field);
  let category = translate[field];

  let tooltip = d3.select("#choro-tooltip");
  
  var backgroundColor = colorScale(value);
  var textColor = computeContrastColor(backgroundColor);

  tooltip
    .style("background-color", backgroundColor)
    .style("color", textColor);

  tooltip
    .select("#choro-value")
    .text("Value: " + legendTickFormat(value));
  
  tooltip
    .select("#choro-category")
    .text("Region: " + category);
};

async function drawLegend(colorScale) {
  let legend = d3.select("#first-view")
    .append("g")
    .attr("id", "choro-legend");

  makeLegend({
    legend: legend,
    color: colorScale,
    width: legendWidth,
    height: legendHeight,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    ticks: legendTicks,
    tickSize: legendTickSize,
    tickFormat: legendTickFormat
  })

  legend.selectAll("text")
    .attr("class", "text disable-select");

  legend.attr("transform", `translate(${legendMargin.left},${legendMargin.top})`);
}

async function updateLegend(colorScale) {

  let x = Object.assign(
    colorScale.copy().interpolator(d3.interpolateRound(legendHeight, 0)),
    { range() { return [legendHeight, 0]; } });

  let axis = d3.select(".choro-legend-axis");

  d3.transition().duration(500).select(".choro-legend-axis")
    .call(d3.axisRight(x)
      .ticks(legendTicks, legendTickFormat)
      .tickFormat(legendTickFormat)
      .tickSize(legendTickSize))
    .call(tickAdjust);

  axis.call(g => g.select(".domain").remove());
  
  let legend = d3.select("#choro-legend");
  legend.selectAll("text")
    .attr("class", "text disable-select");
}


async function drawChoro(sales) {
  addChoroTooltip();
  choroData = computeTotalSales(sales);
  const colorScale = computeColorScale(choroData);


  let onclick = function (d) {
    let element = d3.select(this);
    element.classed("highlighted", !element.classed("highlighted"));

    let region = element.attr("id");

    if (element.classed("highlighted")) {
      selectedRegions.push(region);
    } else {
      selectedRegions.splice(selectedRegions.indexOf(region), 1);
    }

    updateChosenRegions(selectedRegions);
  };

  let onScroll = function (d) {
    let element = d3.select("#choro-tooltip");
    element.classed("hidden", true);
    // element.classed("disable-hover", true);
  };

  let onMouseOver = function(d) {
    let id = d3.select(d.target).attr("id");
    updateTooltip(id, choroData, colorScale);
  };
  
  let onMouseMove = function(d) {

    let tooltip = d3.select("#choro-tooltip");
    tooltip.classed("hidden", false);
    
    let tooltipHeight = tooltip.node().getBoundingClientRect().height;
    let tooltipWidth = tooltip.node().getBoundingClientRect().width;
    
    let coords = d3.pointer(d, d3.select("body").node());
    
    tooltip
      .style("left",(coords[0] - tooltipWidth) + "px")
      .style("top", (coords[1] - tooltipHeight) + "px");
  };

  let onMouseOut = function() { 
    d3.select("#choro-tooltip").classed("hidden", true);
  };

  // Map and projection
  let projection = d3.geoMercator().translate([width, height]);
  projection.fitSize([width, height], { type: "FeatureCollection", features: geo.features });

  // Draw the map
  svg.attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
    .append("g")
    // center the map in the svg
    .attr("transform", "translate(" + (viewBoxWidth - width) / 2 + "," + (viewBoxHeight - height) / 2 + ")")
    .selectAll("path")
    .data(geo.features)
    .join("path")
    // draw each region
    .attr("class", "region")
    .attr("d", d3.geoPath()
      .projection(projection))
    // set the color of each region
    .attr("id", function (d) {
      let region = d.properties.continent
      return region;
    })
    .attr("fill", function (d) {
      let region = d.properties.continent
      d.total = choroData.get(region) || 0;
      return colorScale(d.total);
    });

  // add interaction events
  d3.selectAll(".region")
    .on("click", onclick)
    .on("mouseover", onMouseOver)
    .on("mousemove", onMouseMove)
    .on("mouseout", onMouseOut);
  
  d3.select("#main-view").on("scroll", onScroll);
  drawLegend(colorScale);
};

function getselectedRegions() {
  return selectedRegions;
}

async function updateChoro(sales) {
  choroData = computeTotalSales(sales);

  const colorScale = computeColorScale(choroData);
  let onMouseOver = function(d) {
    let id = d3.select(d.target).attr("id");
    updateTooltip(id, choroData, colorScale);
  };

  svg.selectAll(".region")
    .data(geo.features).transition().duration(500)
    .attr("fill", function (d) {
      let region = d.properties.continent
      d.total = choroData.get(region) || 0;
      return colorScale(d.total);
    });

  svg.selectAll(".region").on("mouseover", onMouseOver);

  updateLegend(colorScale);
}