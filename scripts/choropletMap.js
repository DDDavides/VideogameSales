// The svg
const svg = d3.select("#first-view");
const boundingRect = svg.node().getBoundingClientRect();
const width = boundingRect.width;
const height = boundingRect.height;
const viewBoxWidth = width;
const viewBoxHeight = height;

const continents = ["NA", "EU", "JP", "Other"];
let selectedContinents = [];
let colorPalette = null;
let geo = null;

const legendWidth = .02 * width;
const legendHeight = .25 * width;
const legendMargin = { top: height / 2, right: 0, bottom: 0, left: 20 };
const legendTicks = 5;
const legendTickSize = 5;
const legendTickFormat = (d) => { return d3.format("")(d / 1000) + " B"; }

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
  let data = new Map();

  // compute total sales for each continent
  for (let i = 0; i < sales.length; i++) {
    let sale = sales[i];

    // iterate over continents
    for (let j = 0; j < continents.length; j++) {
      let continent = continents[j];

      if (!data.has(continent)) {
        data.set(continent, 0);
      }

      let curr_sales = data.get(continent);
      let new_sales = parseFloat(sale[continent + "_Sales"]);

      data.set(continent, curr_sales + new_sales);
    }
  }
  return data;
}

function computeColorScale(data) {
  const maximum = d3.max(data.values());
  return d3.scaleSequential(colorPalette)
    .domain([0, maximum <= 100 ? 100 : maximum]);
}

async function drawLegend(colorScale) {
  var legend = d3.select("#first-view")
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
    .attr("class", "text");

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
}


async function drawChoro(sales, map, colors) {
  geo = map;
  colorPalette = colors;

  data = computeTotalSales(sales);
  const colorScale = computeColorScale(data);


  let onclick = function (d) {
    let element = d3.select(this);
    element.classed("highlighted", !element.classed("highlighted"));

    let continent = element.attr("name");

    if (element.classed("highlighted")) {
      selectedContinents.push(continent);
    } else {
      selectedContinents.splice(selectedContinents.indexOf(continent), 1);
    }
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
    // draw each continent
    .attr("class", "continent")
    .attr("d", d3.geoPath()
      .projection(projection))
    // set the color of each continent
    .attr("name", function (d) {
      var continent = d.properties.continent
      return continent;
    })
    .attr("fill", function (d) {
      let continent = d.properties.continent
      d.total = data.get(continent) || 0;
      return colorScale(d.total);
    });

  // add onclick event
  d3.selectAll(".continent")
    .on("click", onclick);

  drawLegend(colorScale);
};

function getSelectedContinents() {
  return selectedContinents;
}

async function updateChoro(sales) {
  data = computeTotalSales(sales);

  const colorScale = computeColorScale(data);

  svg.selectAll(".continent")
    .data(geo.features).transition().duration(500)
    .attr("fill", function (d) {
      var continent = d.properties.continent
      d.total = data.get(continent) || 0;
      return colorScale(d.total);
    });

  updateLegend(colorScale);
}