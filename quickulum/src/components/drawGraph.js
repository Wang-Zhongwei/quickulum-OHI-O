/** @format */
import * as d3 from "d3";

function drawGraph(
  className,
  nodesData,
  linksData,
  handleNodeClick,
  options = {}
) {
  const svg = d3.select(className);
  const rect = svg.node().getBoundingClientRect();
  const width = parseInt(rect.width);
  const height = parseInt(rect.height);

  // create a color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const creditsScale = d3.scaleLinear().domain([1, 5]).range([5, 25]);
  // create a force simulation

  const minThreshold = 300;
  // const maxThreshold = 300;
  const minDistance = 100;
  const strengthRepulsion = 30;
  const strengthAttraction = 19;

  const simulation = d3
    .forceSimulation(nodesData)
    .force(
      "link",
      d3
        .forceLink(linksData)
        .id((d) => d.id)
        .distance(130)
    )
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength((d) => {
          if (d.distance < minThreshold) {
            return -strengthRepulsion; // repel if too close
          } else {
            return +strengthAttraction; // attract if too far
          }
        })
        .distanceMin(minDistance)
    )

    .force("collide", d3.forceCollide(50))
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.3));
  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"]) // Different link/path types can be defined here
    .enter()
    .append("marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 0 6 6")
    .attr("refX", 6) // Controls the shift of the arrowhead along the path
    .attr("refY", 3)
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
    .attr("orient", "auto")
    .attr("fill", "#666")
    .append("svg:path")
    .attr("d", "M 0 0 L 6 3 L 0 6 z");

  // define filters
  const defs = svg.append("defs");

  const filter = defs
    .append("filter")
    .attr("id", "dropshadow")
    .attr("height", "200%")
    .attr("width", "200%");

  filter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 2)
    .attr("result", "blur");

  filter
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("result", "offsetBlur");

  // Add these two lines to create a white shadow
  filter.append("feFlood").attr("flood-color", "white").attr("result", "color");
  filter
    .append("feComposite")
    .attr("in", "color")
    .attr("in2", "offsetBlur")
    .attr("operator", "in")
    .attr("result", "shadowWithColor");

  const feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode").attr("in", "shadowWithColor");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // define gradients
  const gradient = defs
    .append("linearGradient")
    .attr("id", "nodeGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#f7ac57") // Start color
    .attr("stop-opacity", 1);

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#fe5196") // End color
    .attr("stop-opacity", 1);

  // create nodes
  const nodes = svg
    .append("g")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("cursor", "pointer")
    .selectAll("circle")
    .data(nodesData)
    .join("circle")
    .attr("opacity", 0.4) // Initial opacity for all nodes
    .attr("r", (d) => creditsScale(d.credits))
    .attr("fill", (d) => {
      const words = d.id.split("-");
      switch (options?.colorRank) {
        case "department":
          return color(words[0]);

        case "courseNumber":
          return color(words[1].charAt(0));

        default:
          return color(words[1].charAt(0));
      }
    })
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
    .on("click", function (event, d) {
      // When the mouse goes over a node
      console.log("clicked on node", d.id);
      event.preventDefault();
      handleNodeClick(d, this);
    }); // Hide the tooltip when the mouse is no longer over a node;

  let nodeLegendData = color.domain().map((d) => ({
    value: d + "-xxx",
    color: color(d),
  }));

  // 2. Create a group (`g`) element to hold the legend items.
  const nodeLegend = svg.append("g").attr("transform", "translate(140, 10)"); // Adjust this to position the legend

  // 3. Append circles for the color samples.
  nodeLegend
    .selectAll("circle")
    .data(nodeLegendData)
    .enter()
    .append("circle")
    .attr("cx", 0) // Adjust as needed
    .attr("cy", (d, i) => i * 30 + 10) // 30 pixels space for each item
    .attr("r", 8) // Adjust the radius as needed
    .attr("fill", (d) => d.color)
    .attr("opacity", 0.5);

  // 4. Append text labels next to the circles.
  nodeLegend
    .selectAll("text")
    .data(nodeLegendData)
    .enter()
    .append("text")
    .attr("x", 10)
    .attr("y", (d, i) => i * 30 + 10) // Align with the center of the circle
    .text((d) => d.value)
    .attr("dominant-baseline", "middle") // Vertically center the text
    .attr("fill", "#ddd"); // Set the text color to white

  // Add the links as path elements with arrowhead markers
  const links = svg
    .append("g")
    .selectAll("line")
    .data(linksData)
    .join("line")
    .attr("stroke", (d) => {
      if (d.group === 0) {
        return "rgba(221, 104, 180, 0.42)"; // Red with 50% opacity
      } else if (d.group === 1) {
        return "rgba(128, 221, 165, 0.42)"; // Green with 50% opacity
      } else if (d.group === 2) {
        return "rgba(231, 127, 57, 0.42)"; // Blue with 50% opacity
      } else {
        return "rgba(102, 102, 102, 0.58)"; // Gray with 50% opacity
      }
    })
    .attr("stroke-width", 3)
    .attr("marker-end", "url(#end)")
    .attr("stroke-dasharray", (d) => (d.type === "coreq" ? "5,5" : null));

  // 1. Define the legend's data.
  const edgeLegendData = [
    { color: "rgba(221, 104, 180, 0.5)", label: "Group 0" },
    { color: "rgba(128, 221, 165, 0.5)", label: "Group 1" },
    { color: "rgba(231, 127, 57, 0.5)", label: "Group 2" },
    { color: "rgba(102, 102, 102, 0.6)", label: "Group 3" },
  ];

  const edgeLegend = svg.append("g").attr("transform", "translate(25, 10)");
  // 3. Append lines for the color samples.
  edgeLegend
    .selectAll("line")
    .data(edgeLegendData)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", (d, i) => i * 30 + 10) // +10 to position it in the middle of the space
    .attr("x2", 20)
    .attr("y2", (d, i) => i * 30 + 10) // +10 to position it in the middle of the space
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", 2.5);

  // 4. Adjust text labels to align next to the lines.
  edgeLegend
    .selectAll("text")
    .data(edgeLegendData)
    .enter()
    .append("text")
    .attr("x", 25)
    .attr("y", (d, i) => i * 30 + 10) // +10 to position it in the middle of the space
    .text((d) => d.label)
    .attr("dominant-baseline", "middle") // Vertically center the text
    .attr("fill", "#ddd"); // Set the text color to white

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

  const labels = svg
    .append("g")
    .selectAll("text")
    .data(nodesData)
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
  nodes.append("title").text((d) => d.id);

  // add tick function
  simulation.on("tick", () => {
    const newLocal = "y2";
    links
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

    nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
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
