// set margin for svg
const margin = {top: 50, right: 50, bottom: 50, left: 50};
const svg_continent = d3.select("#div-chosen");
const boundingRect_continent = svg_continent.node().getBoundingClientRect();
const vbWidth = boundingRect_continent.width;
const vbHeight = boundingRect_continent.height;
let chosen_continents = [];
let db = [];
let feature = d3.select("#field-select > option").node().text; // feature selezionata dall'utente nel bottone nella second view

svgBarChart = d3.select("#bar-chart")
svgWidth = svgBarChart.node().getBoundingClientRect().width
svgHeight = svgBarChart.node().getBoundingClientRect().height

// define axes scale
// TODO: metti domain(["genres"]) per vedere cosa succede
xScale = d3.scaleBand().range([0, svgWidth-margin.right-margin.left]).padding(0.1)
yScale = d3.scaleLinear().range([svgHeight-margin.bottom-margin.top,0])

// Scale for subgroup position
xSubgroup = d3.scaleBand()
              .range([0, xScale.bandwidth()])
              .padding(0.05)

// define axes
xAxis = d3.axisBottom().scale(xScale)
yAxis = d3.axisLeft().scale(yScale).tickFormat(legendTickFormat)

// TODO: cambia font
// svgBarChart.selectAll("text").attr("class", "text")

cartesian = svgBarChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// just a simple scale of colors
color = d3.scaleOrdinal()
    .range(d3.schemeTableau10);

async function drawChosenRegions(){  
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

async function drawBarChart(sales){
  db = sales
  // di default il dominio dell'asse x è mappato con i generi selezionati
  toggled_features = eval("getToggled" + feature + "()")
  xScale.domain(toggled_features)
  xSubgroup.domain(chosen_continents)

  // draw axes
  cartesian.append("g").attr("class","x-axis").attr("transform", `translate(0, ${svgHeight - margin.top - margin.bottom})`).call(xAxis)
  cartesian.append("g").attr("class","y-axis").call(yAxis);
}

async function updateXDomain(xDomain){
  xScale.domain(xDomain)
  d3.select(".x-axis").transition().call(xAxis)
}

async function updateXSubgroup(xSubgroupDomain){
  xSubgroup.domain(xSubgroupDomain)
  xSubgroup.range([0, xScale.bandwidth()])
}

async function updateYDomain(yDomain){
  yScale.domain(yDomain)
  d3.select(".y-axis").transition().call(yAxis)
}

// il dataset mi arriva già filtrato da moli, ma devo raggruppare per continenti selezionati
// BUG 5: Se seleziono un continente, poi tolgo e rimetto un genere, il dato relativo a quel genere non viene visualizzato
//        ma viene visualizzato solo dopo aver selezionato un altro genere
// probabilmente è relativo al binding coi dati
async function updateBarChart(dataset){
  db = dataset
  // BRUTALE: ogni volta che richiamo updateBarChart cancello e poi ricalcolo tutto
  // TODO: trova un modo per fare in modo che non venga ricalcolato tutto ogni volta
  //        [
  //          { feature1: "", 
  //            regions2sales: [{regionName: "", regionSales: #}, ...]
  //          }, 
  //          ...
  //        ]
  tot_feature2continents_sales = []

  // prendi i generi presenti nel dataset
  toggled_features = eval("getToggled" + feature + "()")

  // costruisco la struttura dati che mi serve per visualizzare i dati nel bar chart
  // TODO: usa d3.js map o nest (Quando faccio il get, riporta una copia del valore o il puntatore ad esso?)
  // per manetenere l'ordine dei generi, inizializzo la struttura così che abbia tutti i generi già ordinati al suo interno
  toggled_features.forEach(currentToggledFeature => {
      tot_feature2continents_sales.push({"feature": currentToggledFeature, "regions2sales": []})
    }
  );
  // riempio la struttura dati con i dati del dataset
  for (let i = 0; i < dataset.length; i++) {
    current_feature = eval("dataset[i]." + feature)
    if(current_feature == "N/A"){
      continue
    }
    currData = tot_feature2continents_sales.find(d => d["feature"] == current_feature)
    for (let j = 0; j < chosen_continents.length; j++) {
      name2sale = currData["regions2sales"].find(d => d["regionName"] == chosen_continents[j])
      // se il continente è già presente aggiorno il valore
      if(name2sale != undefined){
        name2sale["regionSales"] += parseFloat(dataset[i][chosen_continents[j] + "_Sales"])
      }
      // altrimenti lo inizializzo
      else{
        currData["regions2sales"].push({"regionName": chosen_continents[j], "regionSales": parseFloat(dataset[i][chosen_continents[j] + "_Sales"])})
      }
    }
  }

  console.log(tot_feature2continents_sales)

  // di default il dominio dell'asse x è mappato con i generi
  await updateXDomain(tot_feature2continents_sales.map(d => d.feature))
  // await updateXDomain(toggled_features)

  // aggiorna le barre che saranno visualizzate per ogni genere (una per continente scelto)
  await updateXSubgroup(chosen_continents)

  // aggiorno il dominio dell'asse y
  await updateYDomain([0, d3.max(tot_feature2continents_sales, d => d3.max(d.regions2sales, d => d.regionSales))])

  //===========================DRAW BAR CHART================================
  // TODO: aggiungi transizioni alle animazioni e disaccoppiale
  // BAR GROUP
  // Data join: un gruppo per feature (valori asse x)
  barGroup = cartesian.selectAll(".feature_group")
                      .data(tot_feature2continents_sales)
  // Enter
  barGroup.enter().append("g")
                  .attr("class", "feature_group")
                  .attr("id", d => d.feature)
                  .attr("transform", function(d) { return "translate(" + xScale(d.feature) + ",0)"; })
  // Update
  barGroup.attr("transform", function(d) { return "translate(" + xScale(d.feature) + ",0)"; })
          .attr("id", d => d.feature)
          // metti in enterRect i rettangoli che devono essere al suo interno
  // Exit
  barGroup.exit().remove()

  // SINGLE BAR
  // tanti rettangoli quanti sono i continenti scelti
  barGroup = cartesian.selectAll(".feature_group") // necessario perchè ora ci sono dei nuovi gruppi che altrimenti non sarebbero visti 
  dataRects = barGroup.selectAll("rect")
                      .data(function(d) { return d.regions2sales}) // data = [{regionName: "", regionSales: #}, ...]

  // Enter: append a new rect every time we have an extra data vs dom element
  dataRects.enter().append("rect")
           .attr("id", d => d.regionName)
           .attr("x", function(d) {
                //console.log("regionName ", d.regionName); 
                //console.log("xSubgroup ", xSubgroup(d.regionName));
                return xSubgroup(d.regionName); })
           .attr("y", function(d) { return yScale(d.regionSales); })
           .style("fill", function(d) { return color(d.regionName); })
           .attr("width", xSubgroup.bandwidth())
           .attr("height", function(d) { return svgHeight - margin.top - margin.bottom - yScale(d.regionSales); })

  // Update: updates will happend neither inserting new elements or updating them
  dataRects.attr("x", function(d) { return xSubgroup(d.regionName); })
            .attr("y", function(d) { return yScale(d.regionSales); })
            .style("fill", function(d) { return color(d.regionName); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function(d) { return svgHeight - margin.top - margin.bottom - yScale(d.regionSales); })

  // Exit
  dataRects.exit().attr("height", 0).remove()
}

// funzione aggiorna le regioni che sono state selezionate nella prima view
// @parama choroData, mappa con chiave il nome della regione (NA, EU, JP, Other) e valore il totale delle vendite
// @parama selectedRegions, array con i nomi delle regioni selezionate dall'utente
async function updateChosenRegions(selectedRegions){
  // Elimina tutto quello che c'era prima nell'svg
  // TODO: vedi se è il caso di fare un update invece di un remove
  d3.select("#chosen-continent-view").selectAll("*").remove();
  
  // TODO: potrei avere problemi con l'async, magari finisce prima l'aggiornamento al bar char quindi non visualizzo bene i dati
  chosen_continents = selectedRegions;
  // TODO: devo passare i dati corretti
  // TODO: controlla cosa succede ai generi
  // BUG: Se come prima cosa clicco su una regione spariscono i generi nel bar chart
  updateBarChart(db);

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
    .style("fill", function(d) { return color(d.properties.continent); })
}

// bottone per la selezione della feature (asse x barchart)
async function toggleFeature(featureToggled){
  feature = featureToggled
  updateBarChart(db)
}