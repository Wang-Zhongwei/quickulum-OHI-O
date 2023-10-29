/** @format */

import React from "react";
import "./Sidebar.css";

function Sidebar({ selectedNodes }) {
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
                <li key={node.id}>{node.title}</li>
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
              console.log("Generate schedule button clicked");
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
