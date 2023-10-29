# By Rohan "RJ" Jaiswal, using the OSU API

from urllib.request import urlopen
from dotenv import load_dotenv 
import ast
import json
import openai
import os

load_dotenv()
openai.api_key = os.environ["OPENAI_API_KEY"]

# store URL
url = "https://content.osu.edu/v2/classes/search?q="

# store JSON response
cse_json = json.loads(urlopen(url + "CSE").read())

with open("promptDirect.txt") as file:
    my_prompt = file.read()

# generates a list of prerequisites from the course description
def parse_prerequisites(desc):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "Your job is to convert a string which is the text description of prerequisites for a computer science and engineering course into a list of lists in Python syntax. In this list of lists, class numbers should be grouped if they are grouped using or. A group of classes in the inner list represent different options for filling one prerequisite, while the outer list contains each set of classes a student can choose from. Furthermore, to write quotes properly you must add a backslash before each one.\n\nThere are specifications the output must meet. First, it must only contain the list of lists, and no other text is allowed. Second, it must be on one line. Third, you must not put any text before the list, including \"Output value:\".\n\nUse the provided examples as guidelines for the correct format.\n\nExample 1:\n\nInput:\nIntellectual foundations of software engineering; design-by-contract principles; mathematical modeling of software functionality; component-based software from client perspective; layered data representation.\\nPrereq: 1212, 1221, 1222, 1223, 1224, Engr 1221, 1281.01H, 1281.02H, or CSE Placement Level A. Prereq or concur: Math 1151, 1161.01, or 1161.02. Not open to students with credit for 5022. This course is available for EM credit.\n\n[[\\\"CSE-1212\\\", \\\"CSE-1221\\\", \\\"CSE-1222\\\", \\\"CSE-1223\\\", \\\"CSE-1224\\\", \\\"Engr-1221\\\", \\\"Engr-1281.01H\\\", \\\"Engr-1281.02H\\\"]]\n\nOutput 2:\nIntensive group project involving design, development, and documentation of a web application; client-side and server-side scripting; communication skills emphasized; builds programming maturity.\nPrereq: 2231; and 2321; and 2421 or 3430, or 2451 and ECE 2560; and enrollment in CSE, CIS, ECE, or Data Analytics major.\n\n[[\\\"CSE-2231\\\"], [\\\"CSE-2321\\\"], [\\\"CSE-2421\\\", \\\"CSE-3430\\\"]]\n\nExample 3: \nDesign/analysis of algorithms and data structures; divide-and-conquer; sorting and selection, search trees, hashing, graph algorithms, string matching; probabilistic analysis; randomized algorithms; NP-completeness.\\nPrereq: 2231, 2321, and Stat 3460 or 3470, and enrollment in CSE, CIS, ECE, Data Analytics, or Math major, or CIS minor. Concur: Math 3345. Not open to students with credit for 5331.\n\n[[\\\"CSE-2231\\\"], [\\\"CSE-2321\\\"], [\\\"Stat-3460\\\", \\\"Stat-3470\\\"]]\n\nExample 4:\nDatabase systems use, logical design, entity-relationship model, normalization, query languages and SQL, relational algebra and calculus, object relational databases, XML, active databases; database design project.\\nPrereq: 2123 or 2231; and 2321, or 2111 and Math 2366; and enrollment in CSE, CIS, ISE, Data Analytics, ECE, Engr Physics, or Business Info Sys majors, or CIS minor. Not open to students with credit for 5241.\n\n[[\\\"CSE-2123\\\", \\\"CSE-2231\\\"], [\\\"CSE-2321\\\"]]\n\nExample 5:\nInput:\nProblem solving techniques using productivity software; spreadsheets, formulas, conditional logic; relational databases, relational algebra; word processing; data presentation; graphics.\\nPrereq: Not open to students with credit for 1112 (105), 1113 (101), or 200. GE quant reason math and logical anly course. GE foundation math and quant reasoning or data anyl course.\n\n[]\n\nI would like to discuss examples 3 and 4. In these examples, a student has the choice between taking one course, or taking two. The last two courses in these examples are joined by an and. Ignore these last two courses, as is done in the examples.\n\nExamples of output not allowed:\n\nExample 1:\n[\n    [\\\"CSE-2221\\\"],\n    [\\\"CSE-2321\\\"]\n]\n\nThis output is not allowed because it takes multiple lines.\n\nExample 2:\n\\n\\n[[\\\"CSE-2221\\\"], [\\\"CSE-2421\\\"]]\n\nThis output is not allowed because it contains newline characters, and does not contain only the list. The only special characters allowed are \\\" and -\n\nExample 3:\nHere is the output: [[\\\"CSE-2221\\\"], [\\\"CSE-2421\\\"]]\n\nThis is not allowed because it contains text other than the list.\n\nExample 4:\n[[\\\"OR-2421\\\"], [\\\"AND-2231\\\"]]\n\nThis is not allowed because OR and AND are not valid codes for departments.\n\nExample 5:\n[[\"CSE-2421\"], [\"CSE-2231\"]]\n\nThis is not allowed because we are using \" and not \\\".\n\nExample 6:\nOutput value:\n[[\\\"CSE-2421\\\"], [\\\"CSE-2231\\\"]]\n\nThis is not allowed because there can only be the list, and no text saying \"output value\"\n\n"
            },
            {
                "role": "user",
                "content": desc
            }
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    generated_text = response['choices'][0]['message']['content']
    clean_text = generated_text.replace('\\"', '"')
    prerequisites = ast.literal_eval(clean_text)
    return prerequisites


# empty dict to store data from
data = {}

# generates a dictionary entry for a course and places it into a larger dictionary
def assemble(data, course):
    # parse_prerequisites works weirdly, everything else is fine
    data[course["subject"] + "-" + course["catalogNumber"]] = {
        "classNumber": course["catalogNumber"],
        "department": course["subject"],
        "name": course["title"],
        "dependencies": parse_prerequisites(course["description"]),
        "credits": course["minUnits"]
    }


for num in cse_json["data"]["courses"]:
    if num["course"]["catalogNumber"] not in data.keys():
        assemble(data=data, course=num["course"])
        if len(data) > 5:
            break

def verify(data: dict, subject: str):
    my_keys = data.keys()
    temp_dict = {}
    for course, info in data.items():
        for row in info["dependencies"]:
            for prereq in row:
                if prereq.startswith(subject) and (prereq not in my_keys):
                    print("Entering the innermost thing")
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

# Writing to cse.json
with open("cse2.json", "w") as outfile:
    outfile.write(json_data)
