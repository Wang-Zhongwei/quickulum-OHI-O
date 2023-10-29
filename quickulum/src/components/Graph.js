/** @format */

import drawGraph from "./drawGraph.js";
import React from "react";
import { useEffect, useState } from "react";
import * as d3 from "d3";
import "./Graph.css";

// TODO: add legends
// TODO: hide edge behind nodes
// TODO: fix black box border in the sidebar
function Graph(props) {
  const setSelectedNodes = props.setSelectedNodes;
  const [colorRank, setColorRank] = useState("department");

  function handleNodeClick(node, clickedElement) {
    setSelectedNodes((currentSelectedNodes) => {
      const nodeElement = d3.select(clickedElement);

      if (currentSelectedNodes.some((selected) => selected.id === node.id)) {
        // If the node is already selected, deselect it
        nodeElement.attr("opacity", 0.5); // Non-selected opacity
        nodeElement.style("filter", ""); // Remove drop shadow
        return currentSelectedNodes.filter((n) => n.id !== node.id);
      } else {
        // TODO!!!: debug when get complete data
        // If the node is not selected, select it if it meets dependency requirements
        if (
          node?.dependencies.length === 0 ||
          node?.dependencies[0].length === 0 ||
          node?.dependencies.every((group_list) =>
            group_list.some((dep) =>
              currentSelectedNodes.some((selected) => selected.id === dep)
            )
          )
        ) {
          nodeElement.attr("opacity", 1); // Full opacity for selected node
          nodeElement.style("filter", "url(#dropshadow)"); // Apply drop shadow filter
          return [...currentSelectedNodes, node];
        } else {
          return currentSelectedNodes;
        }
      }
    });
  }

  useEffect(() => {
    console.log("useEffect is running");

    // Draw the graph
    drawGraph(".graph", props?.nodes, props?.links, handleNodeClick, {
      colorRank: colorRank,
    });

    // Return a cleanup function
    return () => {
      d3.select(".graph").selectAll("*").remove(); // This removes all child elements of the SVG
    };
  }, [colorRank]);

  return (
    <div className="canvas">
      {/* <button className="toggle-button" onClick={toggleColorRank}>
        Toggle Color Rank: {colorRank}
      </button> */}

      <div className="toggle-container">
        <div>
          <div className="label">Color Rank</div>
          <div className="toggle-button">
            <button
              className={`toggle-option ${
                colorRank === "department" ? "active" : ""
              }`}
              onClick={() => setColorRank("department")}
            >
              Department
            </button>
            <button
              className={`toggle-option ${
                colorRank === "courseNumber" ? "active" : ""
              }`}
              onClick={() => setColorRank("courseNumber")}
            >
              Course Number
            </button>
          </div>
        </div>
      </div>

      {/* TODO: scrollable canvas */}
      {/* TODO: not hard code width and height */}
      <div className="graph-container">
        <svg className="graph"></svg>
      </div>
      {/* TODO: leave area on bottom for schedule visualization*/}
    </div>
  );
}

export default Graph;
