# Algorithm by Rohan "RJ" Jaiswal
# Adapted from chaudhary1337's solution on Leetcode 1494

import json
from collections import defaultdict

with open("cse.json", "r") as json_file:
    cse_json = json.load(json_file)

graph = {}
visited = {}
schedule = []

for course_name, course_data in cse_json.items():
    # Access the dependencies list
    dependencies = course_data.get("dependencies", [])
    # Populate the graph dictionary
    graph[course_name] = dependencies
    visited[course_name] = 0


def credit_sum(nodes: dict, cse_json: dict):
    return sum(cse_json[course]["credits"] for course in nodes)


in_degrees = defaultdict(int)
for course, dependencies in graph.items():
    for row in dependencies:
        for prereq in row:
            in_degrees[prereq] += 1


def recurse(graph, visited, in_degrees, credit_max, course_json):
    if not any(value > 0 for value in in_degrees.values()):
        return

    # select nodes that haven't been visited and don't have any dependencies
    nodes = {course: dependencies for course, dependencies in graph.items(
    ) if visited[course] == 0 and in_degrees[course] == 0}

    selected = {}
    while len(nodes) > 0 and credit_sum(selected, course_json) < 18:
        course, dependency = nodes.popitem()
        # if hours don't exceed 18, then add the course
        proposed_hours = credit_sum(
            selected, course_json) + course_json[course]["credits"]
        if proposed_hours > 18:
            break
        selected[course] = dependency

    semester = []
    for course, dependencies in selected.items():
        semester.append(course)
        # mark as visited
        visited[course] = 1
        # update the in-degrees
        for row in dependencies:
            for course in row:
                in_degrees[course] -= 1
    schedule.insert(0, semester)
    recurse(graph, visited, in_degrees, credit_max, course_json)


recurse(graph, visited, in_degrees, 18, cse_json)
print(schedule)
