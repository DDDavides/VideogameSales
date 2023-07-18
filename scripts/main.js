async function main() {
    let sales = await d3.csv("./dataset/vgsales.csv");
    const geo = await d3.json("./dataset/geo_final.geojson");

    // Color scale
    const colorPalette = d3.interpolateGreens;
    const colorScale = d3.scaleSequentialLog(colorPalette)
        .domain([1, 5000]);

    drawChoro(sales, geo, colorScale);
    displayInteractive(sales);
};

main();
