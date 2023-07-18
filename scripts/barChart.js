// set margin for svg
const margin = {top: 50, right: 50, bottom: 50, left: 50};
const svg_continent = d3.select("#div-chosen");
const boundingRect_continent = svg_continent.node().getBoundingClientRect();
const vbWidth = boundingRect_continent.width;
const vbHeight = boundingRect_continent.height;

// TODO: falla responsive
async function drawChosenContinent(){  
  // get the dimension of the div containing the chosen continents
  const containerWidth = d3.select("#second-view").node().getBoundingClientRect().width
  const containerHeight = d3.select("#second-view").node().getBoundingClientRect().height

  // set the dimension of the svg containing the chosen continents
  const svgWidth = containerWidth/2 - margin.left - margin.right;
  const svgHeight = containerHeight - margin.top - margin.bottom;

  d3.select("#chosen-continent-view")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
}

async function drawBarChart(){
  const svgBarChart = d3.select("#bar-chart")
  const svgWidth = svgBarChart.node().getBoundingClientRect().width
  const svgHeight = svgBarChart.node().getBoundingClientRect().height

  // define axes scale
  // TODO sulle x ci vanno o i generi o l'anno o le piattaforme e ogni barra corrisponde ai continenti selezionati
  const xScale = d3.scaleBand().range([0, svgWidth-margin.right-margin.left]).domain(["Action", "Adventure", "Fighting"]).padding(0.5)
  const yScale = d3.scaleLinear().range([svgHeight-margin.bottom-margin.top,0]).domain([0,10])

  // define axes
  const xAxis = d3.axisBottom().scale(xScale)
  const yAxis = d3.axisLeft().scale(yScale)

  // TODO: dato fittizio, da metterci nulla e fare update quando moli richiama il metodo update
  data = [["Action", 1], ["Adventure", 2], ["Fighting", 3]]

  // const mapped_data = data.map(function(d) { return [Object.keys(d)[0], d[Object.keys(d)[0]]]; });
  // console.log(mapped_data)

  // draw axes
  cartesian = svgBarChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  cartesian.append("g").attr("class","x-axis").attr("transform", `translate(0, ${svgHeight - margin.top - margin.bottom})`).call(xAxis)
  cartesian.append("g").attr("class","y-axis").call(yAxis)

  // draw bars
  cartesian.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return xScale(d[0]); })
          .attr("y", function(d) { return yScale(d[1]); })
          .attr("width", xScale.bandwidth())
          .attr("height", function(d) { return svgHeight - margin.top - margin.bottom - yScale(d[1]); });
}

async function updateXDomain(){
  // quando faccio cose devo aggiornare il dominio dell'asse x e ritorno i dati associati
}

async function updateYDomain(){
  // quando faccio cose devo aggiornare il dominio dell'asse y e ritorno i dati associati
}

async function updateBarChart(){
  // aggiorno il dominio dell'asse x

  // aggiorno il dominio dell'asse y
}

// TODO: la funzione deve prendere qualcosa che le dica quale continente è stato selezionato
async function updateChosenContinent(){
  svgContinent = d3.select("#chosen-continent-view")
  const svgWidth = svgContinent.attr("width")
  const svgHeight = svgContinent.attr("height")

  // aggirono il/i continenti visibili accanto al bar chart
  // TODO: CAMBIA QUESTO VALORE CHE NON VA BENE e rendilo dinamico in base alle selezioni
  let geo = await d3.json("./dataset/na.geojson");
    
  // Map and projection
  let projection = d3.geoMercator()

  projection.fitSize([svgWidth, svgHeight], {type:"FeatureCollection", features: geo.features});
  
  // Draw the map
  svgContinent.attr("viewBox", "0 0 " + vbWidth + " " + vbHeight)
    .append("g")
    .attr("transform", "translate(" + (vbWidth - svgWidth) / 2 + "," + (vbHeight - svgHeight) / 2 + ")")
    .selectAll("path")
    .data(geo.features)
    .join("path")
    .attr("class", "country")
    .attr("d", d3.geoPath().projection(projection))
}