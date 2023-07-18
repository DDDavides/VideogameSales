import json
import numpy as np
import rdppy as rdp


min_size = 10

def de_detail(data):
    features = data['features']
    for i in range(len(features)):
        coordinates = features[i]['geometry']['coordinates']
        for j in range(len(coordinates)):
            polygon = coordinates[j]
            for k in range(len(polygon)):
                path = polygon[k]
                new_path = np.array(path)

                # use the Ramer-Douglas-Peucker algorithm to reduce the number of points
                mask = rdp.filter(new_path, threshold=.1)
                new_path = new_path[mask]

                new_path = new_path.tolist()
                
                # if the path is too short, delete it
                if len(new_path) < min_size:
                    del data['features'][i]['geometry']['coordinates'][j][k]
                else:
                    data['features'][i]['geometry']['coordinates'][j][k] = new_path


                    


data_path = "./dataset/geo_cleaned.geojson"
new_path = "./dataset/geo_final.geojson"
with open(data_path) as f:
    data = json.load(f)
    de_detail(data)
    json.dump(data, open(new_path, 'w'))
                
                