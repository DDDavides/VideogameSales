async function main() {
    let sales = await d3.csv("./dataset/vgsales.csv");

    // Color scale
    let colorPalette = d3.interpolateGreens;
    drawChoro(sales, colorPalette);
    displayInteractive(sales);
};

main();
