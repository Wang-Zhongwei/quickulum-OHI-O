// Algorithm by Rohan "RJ" Jaiswal
// Adapted from chaudhary1337's solution on Leetcode 1494

const fs = require('fs');

let cseJson;
try {
  const jsonString = fs.readFileSync('cse.json', 'utf8');
  cseJson = JSON.parse(jsonString);
} catch (err) {
  console.error('Error reading the file:', err);
}

const graph = {};
const visited = {};
const schedule = [];

for (const [courseName, courseData] of Object.entries(cseJson)) {
  const dependencies = courseData.dependencies || [];
  graph[courseName] = dependencies;
  visited[courseName] = 0;
}

const creditSum = (nodes, courseJson) => {
  return nodes.reduce((acc, course) => acc + courseJson[course].credits, 0);
};

const inDegrees = {};
for (const [course, dependencies] of Object.entries(graph)) {
  for (const row of dependencies) {
    for (const prereq of row) {
      inDegrees[prereq] = (inDegrees[prereq] || 0) + 1;
    }
  }
}

const recurse = (graph, visited, inDegrees, creditMax, courseJson) => {
  if (!Object.values(inDegrees).some(value => value > 0)) return;

  const nodes = Object.fromEntries(
    Object.entries(graph)
      .filter(([course]) => visited[course] === 0 && (inDegrees[course] || 0) === 0)
  );

  const selected = {};
  while (Object.keys(nodes).length > 0 && creditSum(Object.keys(selected), courseJson) < 18) {
    const course = Object.keys(nodes).pop();
    const dependencies = nodes[course];
    delete nodes[course];

    const proposedHours = creditSum(Object.keys(selected), courseJson) + courseJson[course].credits;
    if (proposedHours > 18) break;
    selected[course] = dependencies;
  }

  const semester = [];
  for (const [course, dependencies] of Object.entries(selected)) {
    semester.push(course);
    visited[course] = 1;
    for (const row of dependencies) {
      for (const course of row) {
        inDegrees[course] -= 1;
      }
    }
  }
  schedule.unshift(semester);
  recurse(graph, visited, inDegrees, creditMax, courseJson);
};

recurse(graph, visited, inDegrees, 18, cseJson);
console.log(schedule);
