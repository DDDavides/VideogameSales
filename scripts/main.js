async function main() {
    let sales = await d3.csv("./dataset/vgsales.csv");
    const geo = await d3.json("./dataset/geo_final.geojson");

    // Color scale
    const colorPalette = d3.interpolateGreens;

    drawChoro(sales, geo, colorPalette);
    displayInteractive(sales);
    drawBarChart();
    drawChosenContinent();
    updateChosenContinent();
};

main();
