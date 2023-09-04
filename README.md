# VideogameSales
This is the repository of the final InfoVis project.

## Dataset
(dataset)[/dataset] folder contains the following (Video Game Sales)[https://www.kaggle.com/datasets/gregorut/videogamesales] dataset.
This dataset contains a list of video games with sales greater than 100,000 copies. It was generated by a scrape of vgchartz.com.

Fields include:
- Rank: Ranking of overall sales
- Name: The gam: name
- Platform: Platform of the games release (i.e. PC,PS4, etc.)
- Year:  Year of the game's release
- Genre:  Genre of the game
- Publisher:  Publisher of the game
- NA_Sales:  Sales in North America (in millions)
- EU_Sales:  Sales in Europe (in millions)
- JP_Sales:  Sales in Japan (in millions)
- Other_Sales:  Sales in the rest of the world (in millions)
- Global_Sales:  Total worldwide sales.

The script to scrape the data is available at https://github.com/GregorUT/vgchartzScrape.
It is based on BeautifulSoup using Python.
There are 16,598 records. 2 records were dropped due to incomplete information.

## Web Page Organization
The web page is organized into two principal areas:
- The first one contains a **Choroplet Map** representing the videogames sales based on the region.
- The second one contains a **Bar Chart** in each geographical area depending on the feature selected (Genre, Platform, Year). This chart can also be modified to display the data in **absolute/relative** visualization.

Both of the areas share a filter by panel that permits to filter data by the three different features (Genre, Platform, Year).