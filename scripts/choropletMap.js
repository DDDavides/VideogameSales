// The svg
const svg = d3.select("#first-view");
const boundingRect = svg.node().getBoundingClientRect();
const width = boundingRect.width;
const height = boundingRect.height;

function legend({
  color,
  title,
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

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("x1", marginLeft - width + marginRight);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(height - marginBottom, marginTop), n));

    svg.append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
      .interpolator(d3.interpolateRound(height - marginBottom, marginTop)),
      { range() { return [height - marginBottom, marginTop]; } });

    svg.append("image")
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
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
      = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
          : color.domain(); // scaleThreshold

    const thresholdFormat
      = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
          : tickFormat;

    x = d3.scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([height - marginBottom, marginTop]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
      .attr("y", (d, i) => x(i))
      .attr("x", marginLeft)
      .attr("height", (d, i) => x(i - 1) - x(i))
      .attr("width", width - marginRight - marginLeft)
      .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
      .domain(color.domain())
      .rangeRound([height - marginBottom, marginTop]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
      .attr("y", x)
      .attr("x", marginLeft)
      .attr("height", Math.max(0, x.bandwidth() - 1))
      .attr("width", width - marginLeft - marginRight)
      .attr("fill", color);

    tickAdjust = () => { };
  }

  svg.append("g")
    .attr("transform", `translate(${width - marginRight},0)`)
    .call(d3.axisRight(x)
      .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
      .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
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
      .attr("class", "title")
      .text(title));

  return svg.node();
}

async function drawLegend(colorScale) {
  let legendWidth =.02*width;
  let legendHeight = .25*width;
  let legendMargin = { top: height / 2 , right: 0, bottom: 0, left: 20 };
  let legendTicks = 5;
  let legendTickSize = 5;
  let legendTickFormat = (d) => {return d3.format("")(d/1000) + " B";}

  d3.select("#first-view")
    .append("g")
      .attr("class", "choro-legend disable-select")
      .append(() => legend({
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
      }));

    d3.select("#first-view").selectAll("text").attr("class", "text");
    d3.select(".choro-legend").attr("transform", `translate(${legendMargin.left},${legendMargin.top})`);
}


async function updateChoro(data, colorScale) {
  let geo = await d3.json("./dataset/geo_final.geojson");
  
  svg.selectAll(".continent")
    .data(geo.features).transition().duration(500)
    .attr("fill", function (d) {
      continent = d.properties.continent
      d.total = data.get(continent) || 0;
      return colorScale(d.total);
    });
}

async function drawChoro(data, colorScale) {
  let geo = await d3.json("./dataset/geo_final.geojson");
  let onclick = function (d) {
    let element = d3.select(this);
    element.classed("highlighted", !element.classed("highlighted"));
  };
  
  // Map and projection
  let projection = d3.geoMercator();

  projection.fitSize([width, height], { type: "FeatureCollection", features: geo.features });

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(geo.features)
    .join("path")
    // draw each continent
    .attr("class", "continent")
    .attr("d", d3.geoPath()
      .projection(projection))
    // set the color of each continent
    .attr("fill", function (d) {
      continent = d.properties.continent
      d.total = data.get(continent) || 0;
      return colorScale(d.total);
    });


  d3.selectAll(".continent")
    .on("click", onclick);
};