// set margin for svg
const margin = {top: 50, right: 50, bottom: 50, left: 50};
const svg_continent = d3.select("#div-chosen");
const boundingRect_continent = svg_continent.node().getBoundingClientRect();
const vbWidth = boundingRect_continent.width;
const vbHeight = boundingRect_continent.height;
let chosen_continents = [];
let db = [];

svgBarChart = d3.select("#bar-chart")
svgWidth = svgBarChart.node().getBoundingClientRect().width
svgHeight = svgBarChart.node().getBoundingClientRect().height

// define axes scale
// TODO: metti domain(["genres"]) per vedere cosa succede
xScale = d3.scaleBand().range([0, svgWidth-margin.right-margin.left]).padding(0.1)
yScale = d3.scaleLinear().range([svgHeight-margin.bottom-margin.top,0])

// Scale for subgroup position
xSubgroup = d3.scaleBand()
              .domain(chosen_continents)
              .range([0, xScale.bandwidth()])
              .padding(0.05)

// define axes
xAxis = d3.axisBottom().scale(xScale)
yAxis = d3.axisLeft().scale(yScale)

// TODO: cambia font
// svgBarChart.selectAll("text").attr("class", "text")

cartesian = svgBarChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  toggled_genres = allGenres
  xScale.domain(toggled_genres)
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
// BUG 2: Se prima clicco un filtro sui generi e poi seleziono il continente, 
//        la barra relativa ad esso non è centrata sul genere
// RISOLTO: Quando si aggiornano i subgroups bisogna rimappare il range

// BUG 3: Se clicco un continente, poi tolgo e rimetto un genere, 
//        updateBarChart rifa lo stesso calcolo più volte aumentando a dismisura le vendite
// RISOLTO: brutalmente cancello e ricalcolo tutto ogni volta

// BUG 4: Ogni volta che metto e tolgo un genere dai filtri, si crea un gruppo dentro in bar chart
// RISOLTO: Togliendo .append("g") ogni volta che definivo barGroup

// BUG 5: Se seleziono un continente, poi tolgo e rimetto un genere, il dato relativo a quel genere non viene visualizzato
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
  toggled_genres = getToggledGenres()

  // costruisco la struttura dati che mi serve per visualizzare i dati nel bar chart
  // TODO: usa d3.js map o nest (Quando faccio il get, riporta una copia del valore o il puntatore ad esso?)
  for (let i = 0; i < dataset.length; i++) {
    current_genre = dataset[i].Genre
    currData = tot_feature2continents_sales.find(d => d["Genre"] == current_genre)
    // se il genere è già presente aggiorno, per ogni continente, i valori esistenti
    if( currData != undefined){
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
    // altrimenti inizializzo il genere
    else{
      // mette in coda questo elemento
      tot_feature2continents_sales.push({"Genre": current_genre, "regions2sales": []})
      for (let j = 0; j < chosen_continents.length; j++) {
        // quindi inizializzo l'ultimo valore appena inserito
        tot_feature2continents_sales[tot_feature2continents_sales.length-1]["regions2sales"].push({"regionName": chosen_continents[j], "regionSales": parseFloat(dataset[i][chosen_continents[j] + "_Sales"])})
      }
    }
  }

  //console.log(tot_feature2continents_sales)

  // di default il dominio dell'asse x è mappato con i generi
  await updateXDomain(tot_feature2continents_sales.map(d => d.Genre))

  // aggiorna le barre che saranno visualizzate per ogni genere (una per continente scelto)
  await updateXSubgroup(chosen_continents)

  // aggiorno il dominio dell'asse y
  await updateYDomain([0, d3.max(tot_feature2continents_sales, d => d3.max(d.regions2sales, d => d.regionSales))])

  //===========================DRAW BAR CHART================================
  // BAR GROUP
  // Data join: un gruppo per feature (valori asse x)
  barGroup = cartesian.selectAll(".feature_group")
                      .data(tot_feature2continents_sales)
  // Enter
  barGroup.enter().append("g")
                  .attr("class", "feature_group")
                  .attr("id", d => d.Genre)
                  .attr("transform", function(d) { return "translate(" + xScale(d.Genre) + ",0)"; })
  // Exit
  barGroup.filter(function(d){console.log("Esce ", d.Genre); return d.Genre}).exit().remove()
  console.log(barGroup)

  // SINGLE BAR
  // tanti rettangoli quanti sono i continenti scelti
  dataRects = barGroup.selectAll("rect")
                      .data(function(d) { return d.regions2sales}) // data = [{regionName: "", regionSales: #}, ...]

  // Enter: append a new rect every time we have an extra data vs dom element
  dataRects.enter().append("rect")
           .attr("id", d => d.regionName)
           .attr("x", function(d) { 
                // console.log("regionName ", d.regionName); 
                // console.log("xSubgroup ", xSubgroup(d.regionName));
                return xSubgroup(d.regionName); })
           .attr("y", function(d) { return yScale(d.regionSales); })
           .attr("width", xSubgroup.bandwidth())
           .attr("height", function(d) { return svgHeight - margin.top - margin.bottom - yScale(d.regionSales); })
           

  // Update: updates will happend neither inserting new elements or updating them
  // TODO: CONTROLLA QUESTO
  dataRects.attr("x", function(d) { return xSubgroup(d.regionName); })
            .attr("y", function(d) { return yScale(d.regionSales); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function(d) { return svgHeight - margin.top - margin.bottom - yScale(d.regionSales); })

  // Exit
  dataRects.exit().transition().attr("height", 0).remove()
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
}