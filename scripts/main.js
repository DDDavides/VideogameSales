var geo = null;
var colorPalette = d3.interpolateGreens;

const regions = ["NA", "EU", "JP", "Other"];
const translate = {
  "NA": "North America",
  "EU": "Europe",
  "JP": "Japan",
  "Other": "Other"
}

async function main() {
    let sales = await d3.csv("./dataset/vgsales.csv");
    geo = await d3.json("./dataset/geo_final.geojson");



    drawChoro(sales);    
    displayInteractive(sales);
    drawBarChart();
    drawChosenContinent();
    // updateChosenRegions();
    updateBarChart(sales);
    initSelect();
};

main();
