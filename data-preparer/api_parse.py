#import urllib library
from urllib.request import urlopen

# import json
import json

import openai
import os
import re

openai.api_key = os.getenv("OPEN_API_KEY")

# store URL
url = "https://content.osu.edu/v2/classes/search?q="

# store JSON response
cse_json = json.loads(urlopen(url + "CSE").read())

with open("promptDirect.txt") as file:
    my_prompt = file.read()

# this is the part that doesn't work properly
# gpt is weird
def parse_prerequisites(desc):
    response = openai.Completion.create(
        prompt = my_prompt + desc,
        engine = "gpt-3.5-turbo-instruct",
    )
    generated_text = response.choices[0].text
    print(generated_text)
    return generated_text.strip("][").split(",")


# empty dict to store data from
data = {}

def assemble(data, course):
    # parse_prerequisites works weirdly, everything else is fine
    data[course["subject"] + "-" + course["catalogNumber"]] = {"classNumber": course["catalogNumber"], "department": course["subject"], "name": course["title"], "dependencies": parse_prerequisites(course["description"]), "credits": course["maxUnits"]}

for num in cse_json["data"]["courses"]:
    if num["course"]["catalogNumber"] not in data.keys():
        assemble(data=data, course=num["course"])
        if len(data) > 5:
            break

json_data = json.dumps(data)

# Writing to cse.json
with open("cse.json", "w") as outfile:
    outfile.write(json_data)
