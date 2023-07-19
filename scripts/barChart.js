// set margin for svg
const margin = {top: 50, right: 50, bottom: 50, left: 50};
const svg_continent = d3.select("#div-chosen");
const boundingRect_continent = svg_continent.node().getBoundingClientRect();
const vbWidth = boundingRect_continent.width;
const vbHeight = boundingRect_continent.height;
// let chosen_continents = [];
chosen_continents = ["EU", "JP"];
let dataset = Array();
// struttura seguente {"feature1": {"continent1": #, "continent2": #,...}, ..., "feaetureN": {"continent1": #, "continent2": #,...},
let tot_genre2continents_sales = {}

// TODO: fai in modo che le feature di tot_genre2continents_sales siano dinamiche in base al bottone (creato da moli) cliccato dall utente

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
  // TODO: rendi dinamico il dominio
  xScale = d3.scaleBand().range([0, svgWidth-margin.right-margin.left]).domain(Object.keys(tot_genre2continents_sales)).padding(0.5)
  yScale = d3.scaleLinear().range([svgHeight-margin.bottom-margin.top,0]).domain([0, d3.max(Object.values(tot_genre2continents_sales).map(d => d3.max(Object.values(d))))])

  // Scale for subgroup position
  xSubgroup = d3.scaleBand()
                .domain(chosen_continents)
                .range([0, xScale.bandwidth()])
                .padding([0.05])

  // define axes
  xAxis = d3.axisBottom().scale(xScale)
  yAxis = d3.axisLeft().scale(yScale)

  // draw axes
  cartesian = svgBarChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  cartesian.append("g").attr("class","x-axis").attr("transform", `translate(0, ${svgHeight - margin.top - margin.bottom})`).call(xAxis)
  cartesian.append("g").attr("class","y-axis").call(yAxis);

  // struttura data = {"feature1": {"continent1": #, "continent2": #,...}, ..., "featureN": {"continent1": #, "continent2": #,...},

  // tot_genre2continents_sales = {"Action": {"NA": 5, "EU": 1, "JP": 10, "Other": 6}, "Sports": {"NA": 20, "EU": 3, "JP": 10, "Other": 23}, "Puzzle": {"NA": 1, "EU": 10, "JP": 11, "Other": 7}}

  console.log(tot_genre2continents_sales)
  
  // draw bars
  // TODO: definisci update e remove, capisci come funzionano e capisci l'ordine di chiamata delle funzioni per fare l'update del bar chart
  cartesian.append("g")
          .selectAll("g")
          // tanti gruppi quante sono le features sull'asse x
          .data(Object.keys(tot_genre2continents_sales))
          .enter().append("g")
          .attr("class", "feature_group")
          .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; })
          .selectAll("rect")
          // tanti rettangoli quanti sono i continenti scelti
          .data(function(d) { return chosen_continents.map(function(key) { return {key: key, value: tot_genre2continents_sales[d][key]}; }); }) 
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return xSubgroup(d.key); })
          .attr("y", function(d) { return yScale(d.value); })
          .attr("width", xSubgroup.bandwidth())
          .attr("height", function(d) { return svgHeight - margin.top - margin.bottom - yScale(d.value); })
}

async function updateXDomain(xDomain){
  xScale.domain(xDomain)
  d3.select(".x-axis").transition().call(xAxis)
}

async function updateXSubgroupDomain(xSubgroupDomain){
  xSubgroup.domain(xSubgroupDomain)
  d3.select(".x-axis").transition().call(xAxis)
}

async function updateYDomain(yDomain){
  yScale.domain(yDomain)
  d3.select(".y-axis").transition().call(yAxis)
}

// il dataset mi arriva già filtrato da moli, ma devo raggruppare per continenti selezionati
async function updateBarChart(dataset){
  // prendi i generi presenti nel dataset
  let genres = getToggledGenres()

  // costruisco la struttura dati che mi serve per visualizzare i dati nel bar chart
  for (let i = 0; i < dataset.length; i++) {
    current_genre = dataset[i].Genre
    // giochi1 genere1 na jp eu other 
    // {genere1: {na: 0, jp: 0, eu: 0, other: 0}, genere2: {...}}
    // se il genere non è presente come chiave, inizializzao il valore 
    if(!tot_genre2continents_sales.hasOwnProperty(current_genre)){
      tot_genre2continents_sales[current_genre] = {}
      for (let j = 0; j < chosen_continents.length; j++) {
        // inizializzo, per il genere corrente e il continente corrente, col valore presente nel record corrente
        tot_genre2continents_sales[current_genre][chosen_continents[j]] = parseFloat(dataset[i][chosen_continents[j] + "_Sales"])
      }
    }
    // altrimenti aggiorno, per ogni continente, i valori esistenti
    else{
      for (let j = 0; j < chosen_continents.length; j++) {
        tot_genre2continents_sales[current_genre][chosen_continents[j]] += parseFloat(dataset[i][chosen_continents[j] + "_Sales"])
      }
    }
  }

  // di default il dominio dell'asse x è mappato con i generi
  updateXDomain(genres)

  // aggiorna le barre che saranno visualizzate per ogni genere (una per continente scelto)
  updateXSubgroupDomain(chosen_continents)

  // aggiorno il dominio dell'asse y
  updateYDomain([0, d3.max(Object.values(tot_genre2continents_sales).map(d => d3.max(Object.values(d))))])

  // redraw bars
  drawBarChart()
}

// TODO: la funzione deve prendere qualcosa che le dica quale continente è stato selezionato
async function updateChosenContinent(chosen_cnts){
  // TODO: potrei avere problemi con l'async, magari finisce prima l'aggiornamento al bar char quindi non visualizzo bene i dati
  // chosen_continents = chosen_cnts;
  // chosen_continents = ["EU", "JP"];
  updateBarChart(dataset);

  let svgContinent = d3.select("#chosen-continent-view")
  const svgWidth = svgContinent.attr("width")
  const svgHeight = svgContinent.attr("height")

  // prendo le features relative ai continenti selezionati
  let chosen_continents_features = geo.features.filter(d => chosen_continents.includes(d.properties.continent)) 
    
  // Map and projection
  let projection = d3.geoMercator()

  // fatto fittare la size data per una corretta visualizzazione
  projection.fitSize([svgWidth, svgHeight], {type:"FeatureCollection", features: chosen_continents_features});
  
  // Draw the map
  svgContinent.attr("viewBox", "0 0 " + vbWidth + " " + vbHeight)
    .append("g")
    .attr("transform", "translate(" + (vbWidth - svgWidth) / 2 + "," + (vbHeight - svgHeight) / 2 + ")")
    .selectAll("path")
    .data(chosen_continents_features)
    .join("path")
    .attr("class", "country")
    .attr("d", d3.geoPath().projection(projection))
}