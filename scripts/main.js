var geo = null;
var sales = null;
var colorPalette = d3.interpolateGreens;

const regions = ["NA", "EU", "JP", "Other"];
const translate = {
  "NA": "North America",
  "EU": "Europe",
  "JP": "Japan",
  "Other": "Other"
}
const allGenres = ["Action", "Adventure", "Fighting", "Misc", "Platform", "Puzzle", "Racing", "Role-Playing", "Shooter", "Simulation", "Sports", "Strategy"];

async function main() {
    sales = await d3.csv("./dataset/vgsales.csv");
    geo = await d3.json("./dataset/geo_final.geojson");



    drawChoro(sales);    
    displayInteractive(sales);
    drawBarChart(sales);
    updateBarChart(sales);
    drawChosenRegions();
    initSelect();
};

main();
