let continents = ["NA", "EU", "JP", "Other"];

function computeTotalSales(sales) {
    let data = new Map();

    // compute total sales for each continent
    for(let i = 0; i < sales.length; i++) {
        let sale = sales[i];
        for (let j = 0; j < continents.length; j++) {
            let continent = continents[j];
            
            if (!data.has(continent)) {
                data.set(continent, 0);
            }

            let curr_sales = data.get(continent);
            let new_sales = parseFloat(sale[continent + "_Sales"]);

            data.set(continent, curr_sales + new_sales);
        }
    }
    return data;
}

async function main() {
    let sales = await d3.csv("./dataset/vgsales.csv");

    let data = computeTotalSales(sales);

    // Color scale
    let colorPalette = d3.interpolateGreens;
    let colorScale = d3.scaleSequential(colorPalette)
        .domain([0, d3.max(data.values())]);

    drawChoro(data, colorScale);
    drawLegend(colorScale);
    displayInteractive(sales);
};

main();
