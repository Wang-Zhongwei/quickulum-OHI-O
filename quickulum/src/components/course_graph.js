/** @format */
import * as d3 from "d3";

function drawGraph(nodes, links) {
  const svg = d3.select("#graph");
  const width = parseInt(svg.attr("width"));
  const height = parseInt(svg.attr("height"));

  // create a color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const creditsScale = d3.scaleLinear().domain([1, 5]).range([5, 25]);
  // create a force simulation
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(100))
    .force("collide", d3.forceCollide(65))
    .force("center", d3.forceCenter(width / 2, height / 2));

  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"]) // Different link/path types can be defined here
    .enter()
    .append("marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 0 8 8")
    .attr("refX", 8) // Controls the shift of the arrowhead along the path
    .attr("refY", 4)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .attr("fill", "#666")
    .append("svg:path")
    .attr("d", "M 0 0 L 8 4 L 0 8 z");

  // Add the links as path elements with arrowhead markers
  const link = svg
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", d => {
      if (d.group === 0) {
        return "red";
      } else if (d.group === 1) {
        return "green";
      } else if (d.group === 2) {
        return "blue";
      } else {
        return "#666";
      }
    })
    .attr("stroke-width", 3)
    .attr("marker-end", "url(#end)")
    .attr("stroke-dasharray", d => (d.type === "coreq" ? "5,5" : null));

  // Create a tooltip div that is hidden by default:
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");
    
  // create nodes
  const node = svg
    .append("g")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => creditsScale(d.credits))
    .attr("fill", (d) => color(d.id.split(" ")[0]))
    .call(drag(simulation))
    .on("mouseover", function (event, d) {
      // When the mouse goes over a node
      return tooltip
        .text(d.title)
        .style("color", "red")
        .style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      return tooltip  
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    })
    .on("click", 
      function (event, d) {
        window.open(d.url);
      }
    ); // Hide the tooltip when the mouse is no longer over a node;

  const labels = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text(function (d) {
      return d.id;
    })
    .style("text-anchor", "middle")
    .style("fill", "#fff")
    .style("font-family", "Arial")
    .style("font-size", 12);

  // add titles to nodes
  node.append("title").text((d) => d.id);

  // add tick function
  simulation.on("tick", () => {
    const newLocal = "y2";
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr(
        "x2",
        (d) =>
          d.target.x -
          creditsScale(d.target.credits) *
            Math.cos(
              Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)
            )
      )
      .attr(
        "y2",
        (d) =>
          d.target.y -
          creditsScale(d.target.credits) *
            Math.sin(
              Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)
            )
      );

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labels.attr("x", (d) => d.x + 50).attr("y", (d) => d.y);
  });

  // add drag functions
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
  return svg;
}

export default drawGraph;
