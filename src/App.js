/** @format */

import "./App.css";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";
import Schedule from "./components/Schedule";
import React from "react";
import { useState, useEffect } from "react";

// TODO: bug when regenerate schedule
// TODO: generate schedule in nodes format
// TODO: add link to course page 
// TODO: add course description
// TODO: add visual guide 

function App() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState([]); // TODO: replace with [] when done testing
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/cse.json")
      .then((response) => response.json())
      .then((data) => {
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
      description: data[key].description,
      semester: data[key].semester,
      dependencies: data[key].dependencies,
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
        setSchedule={setSchedule}
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
              selectedNodes={selectedNodes}
              setSelectedNodes={setSelectedNodes}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
