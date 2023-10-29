import json

with open("cse.json", "r") as file:
    data = json.load(file)

print(data)

def verify(data: dict, subject: str):
    my_keys = data.keys()
    temp_dict = {}
    for course, info in data.items():
        for row in info["dependencies"]:
            for prereq in row:
                if prereq.startswith(subject) and (prereq not in my_keys):
                    temp_dict[prereq] = {
                        "classNumber": prereq.split("-")[1],
                        "department": subject,
                        "name": "",
                        "dependencies": [],
                        "credits": 3
                    }
    data.update(temp_dict)

verify(data, "CSE")

json_data = json.dumps(data)

with open("cse2.json", "w") as outfile:
    outfile.write(json_data)
