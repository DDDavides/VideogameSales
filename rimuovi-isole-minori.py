import json

min_size = 10

def remove(data):
    features = data['features']
    for i in range(len(features)):
        coordinates = features[i]['geometry']['coordinates']
        for j in range(len(coordinates)):
            polygon = coordinates[j]
            for k in range(len(polygon)):
                path = polygon[k]
                if len(path) < min_size:
                    del data['features'][i]['geometry']['coordinates'][j][k]

data_path = "./dataset/geo.geojson"
cleaned_path = "./dataset/geo_cleaned.geojson"
with open(data_path) as f:
    data = json.load(f)
    remove(data)
    json.dump(data, open(cleaned_path, 'w'))
                
                