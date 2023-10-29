/** @format */

import drawGraph from "./drawGraph.js";
import React from "react";
import { useEffect } from "react";
import * as d3 from "d3";
import "./Graph.css";

function Graph(props) {
  const setSelectedNodes = props.setSelectedNodes;

  function handleNodeClick(node, clickedElement) {
    setSelectedNodes((currentSelectedNodes) => {
      const nodeElement = d3.select(clickedElement);

      if (currentSelectedNodes.some((selected) => selected.id === node.id)) {
        // If the node is already selected, deselect it
        nodeElement.attr("opacity", 0.5); // Non-selected opacity
        nodeElement.style("filter", ""); // Remove drop shadow
        return currentSelectedNodes.filter((n) => n.id !== node.id);
      } else {
        // If the node is not selected, select it
        nodeElement.attr("opacity", 1); // Full opacity for selected node
        nodeElement.style("filter", "url(#dropshadow)"); // Apply drop shadow
        return [...currentSelectedNodes, node];
      }
    });
  }


  useEffect(() => {
    console.log("useEffect is running");
    drawGraph(".graph", props?.nodes, props?.links, handleNodeClick);
  }, []);

  return (
    <div className="canvas">
      <svg className="graph" width={1000} height={1000}></svg>
    </div>
  );
}

export default Graph;
