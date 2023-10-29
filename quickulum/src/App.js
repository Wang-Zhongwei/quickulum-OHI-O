/** @format */

import "./App.css";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";
import Schedule from "./components/Schedule";
import React from "react";
import { useState, useEffect } from "react";

const schedule = [
  ["CSE-1222", "CSE-1223"],
  ["CSE-2331", "CSE-2321", "CSE-2221"],
  ["CSE-3241", "CSE3901"],
  ["CSE-5545", "CSE-5052"],
];

function App() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch("./cse.json")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setNodes(getNodesFromData(data));
        setLinks(getLinksFromData(data));
        console.log("Nodes and links loaded");
      })
      .catch((error) => {
        console.error("Error fetching the JSON data:", error);
      });
  }, []);

  const getNodesFromData = (data) => {
    return Object.keys(data).map((key) => ({
      id: key,
      title: data[key].name,
      credits: data[key].credits,
    }));
  };

  const getLinksFromData = (data) => {
    let links = [];

    for (let key in data) {
      const dependencies = data[key].dependencies;

      for (let group = 0; group < dependencies.length; group++) {
        for (let target of dependencies[group]) {
          if (data[target]) {
            // check if the source node exists
            links.push({
              source: key,
              target: target,
              group: group,
            });
          }
        }
      }
    }
    return links;
  };

  return (
    <div className="App">
      <Sidebar
        selectedNodes={selectedNodes}
        setShowSchedule={setShowSchedule}
      />
      <div className="main">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            visibility: showSchedule ? "visible" : "hidden",
          }}
        >
          <Schedule schedule={schedule} setShowSchedule={setShowSchedule} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            visibility: !showSchedule ? "visible" : "hidden",
          }}
        >
          {nodes.length > 0 && links.length > 0 && (
            <Graph
              nodes={nodes}
              links={links}
              setSelectedNodes={setSelectedNodes}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
