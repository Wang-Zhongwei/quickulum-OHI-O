/** @format */

// Algorithm by Rohan "RJ" Jaiswal
// Adapted from chaudhary1337's solution on Leetcode 1494

export function convertToDict(nodes) {
  let result = {};

  for (let node of nodes) {
    let [department, classNumber] = node.id.split("-");

    let dependencies = node.dependencies.map((depGroup) =>
      depGroup.map((dep) => dep)
    );

    result[node.id] = {
      classNumber,
      department,
      name: node.title,
      dependencies: dependencies,
      credits: node.credits,
    };
  }

  return result;
}

export function generateSchedule(json, maxCredit) {
  const graph = {};
  const visited = {};
  const schedule = [];

  for (const [courseName, courseData] of Object.entries(json)) {
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
    if (!Object.values(inDegrees).some((value) => value > 0)) return;

    const nodes = Object.fromEntries(
      Object.entries(graph).filter(
        ([course]) => visited[course] === 0 && (inDegrees[course] || 0) === 0
      )
    );

    const selected = {};
    while (
      Object.keys(nodes).length > 0 &&
      creditSum(Object.keys(selected), courseJson) < 18
    ) {
      const course = Object.keys(nodes).pop();
      const dependencies = nodes[course];
      delete nodes[course];

      const proposedHours =
        creditSum(Object.keys(selected), courseJson) +
        courseJson[course].credits;
      if (proposedHours > creditMax) break;
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

  recurse(graph, visited, inDegrees, maxCredit, json);

  return schedule;
}

export function topologicalSort(data) {
  let visited = {};
  let stack = [];
  // let order = {};

  // Create a list of visited nodes initialized to false
  for (let course in data) {
    visited[course] = false;
  }

  // Utility function for the depth-first traversal of the graph
  function dfs(node) {
    visited[node] = true;

    let dependencies;
    try {
      dependencies = data[node].dependencies;
    } catch (error) {
      console.log("Error for node: " + node);
    }
    for (let i = 0; i < dependencies.length; i++) {
      for (let j = 0; j < dependencies[i].length; j++) {
        if (!visited[dependencies[i][j]]) {
          dfs(dependencies[i][j]);
        }
      }
    }

    // As we backtrack from recursion, push nodes to stack
    stack.push(node);
  }

  // Go through all nodes and perform depth-first traversal
  for (let course in data) {
    if (!visited[course]) {
      dfs(course);
    }
  }

  // while (stack.length) {
  //   order.push(stack.pop());
  // }

  return stack;
  // return order;
}

/**
 * Use cases:
 */
// const newFormats = convertToNewFormat(nodes);
// console.log(newFormats);

// const schedule = generateSchedule(newFormats, 18);
// console.log(schedule);
