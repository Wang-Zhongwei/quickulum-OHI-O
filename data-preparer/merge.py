
# import cse.json and cse2.json
import json
with open("cse.json", "r") as file:
    data = json.load(file)

with open("cse2.json", "r") as file:
    data2 = json.load(file)

# merge to files
for cid in data:
    if cid in data2:
        data[cid]["description"] = data2[cid]["description"]
        data[cid]['semester'] = data2[cid]['semester']

json_data = json.dumps(data)

with open("cse3.json", "w") as outfile:
    outfile.write(json_data)
