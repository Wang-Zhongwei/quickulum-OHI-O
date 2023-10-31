import json

with open("cse.json", "r") as file:
    data = json.load(file)

print(data)

# TODO: make recursive call to course api
# TODO: data cleaning script to make sure all courses have the same format 
# 1. no honor dependencies
# 2. all dependencies are nested lists
def verify(data: dict):
    my_keys = data.keys()
    temp_dict = {}
    for course, info in data.items():
        for row in info["dependencies"]:
            for prereq in row:
                if (prereq not in my_keys):
                    try:
                        [subject, number] = prereq.split("-")
                    except:
                        print(prereq + " is not a valid course")
                    temp_dict[prereq] = {
                        "classNumber": number,
                        "department": subject,
                        "name": "", # TODO: get name from course api
                        "dependencies": [[]], # TODO: get dependencies from course api
                        "credits": 3
                    }
    data.update(temp_dict)

verify(data)

json_data = json.dumps(data)

with open("cse2.json", "w") as outfile:
    outfile.write(json_data)
