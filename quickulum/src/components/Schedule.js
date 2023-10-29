/** @format */

// ScheduleTimeline.js
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";


const ScheduleTimeline = ({ schedule, setShowSchedule }) => {
  const ref = useRef();

  useEffect(() => {
    drawTimeline();
  }, [schedule]);

  const drawTimeline = () => {
    const svg = d3.select(ref.current);

    // Define margins
    const margin = { top: 100, right: 20, bottom: 100, left: 20 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3
      .scaleBand()
      .domain(schedule.map((_, i) => `Semester ${i + 1}`))
      .range([0, width])
      .padding(0.1);

    // Draw x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Draw the bullet points for each class
    schedule.forEach((semester, i) => {
      const yPositions = d3
        .scalePoint()
        .domain(semester)
        .range([0, height])
        .padding(0.5);

      semester.forEach((course, j) => {
        g.append("circle")
          .attr("cx", xScale(`Semester ${i + 1}`))
          .attr("cy", yPositions(course))
          .attr("r", 2)
          .style("fill", "white");

        g.append("text")
          .attr("x", xScale(`Semester ${i + 1}`) + 10)
          .attr("y", yPositions(course))
          .attr("dy", "0.3em")
          .attr("font-size", "10px")
          .attr("fill", "white")
          .text(course);
      });
    });
  };

  return (
    <div>
      <svg ref={ref} width={800} height={400}></svg>
      <div>
        <button
          // className={isGenerateDisabled ? "" : "enabled"}
          onClick={() => {
            console.log("Generate schedule button clicked");
            setShowSchedule(false);
          }}
        >
          Modify Classes
        </button>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
