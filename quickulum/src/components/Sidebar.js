/** @format */

import React from "react";
import "./Sidebar.css";

// TODO: instead of copy this from algorithm.js, try importing it...

const generateSchedule = (cseJson) => {
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
  return schedule;
};

function Sidebar({ selectedNodes, setShowSchedule, setSchedule}) {
  const [creditGoal, setCreditGoal] = React.useState(15);

  const totalCredits = selectedNodes.reduce(
    (sum, node) => sum + node.credits,
    0
  );

  const isGenerateDisabled = totalCredits < creditGoal; // Check if total credits is less than credit goal

  return (
    <div className="sidebar">
      <div className="sidebar-top ">
        <div className="total-credits">
          <h2>Total Credits</h2>
          <div className="container">{totalCredits}</div>
        </div>

        <div className="selected-courses">
          <h2>Selected Courses</h2>
          <div className="container">
            <ul>
              {selectedNodes.map((node) => (
                <li key={node.id} style={{ marginBottom: '10px' }}>
                  {node.id} ({node.title})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="goal">
          <label htmlFor="credit-goal-input">Credit Goal</label>
          <input
            id="credit-goal-input"
            type="number"
            value={creditGoal}
            onChange={(event) => {
              setCreditGoal(parseInt(event.target.value));
              console.log("Credit goal changed to", event.target.value);
            }}
          />
        </div>
        <div className="generate">
          <button
            className={isGenerateDisabled ? "" : "enabled"}
            onClick={() => {
              if (isGenerateDisabled) return;
              setSchedule(generateSchedule(selectedNodes)); 
              console.log("Schedule generated");
              setShowSchedule(true);
            }}
          >
            Generate Schedule
          </button>
        </div>
      </div>
    </div>
  );
}


export default Sidebar;
