/** @format */
import * as d3 from "d3";
import {
  topologicalSort,
  convertToDict,
} from "../schedule-algorithm/algorithm.mjs";

// TODO: fix bug when deselecting nodes from the same
function drawGraph(
  className,
  nodesData,
  linksData,
  selectedNodes,
  handleNodeClick,
  options = {}
) {
  const svg = d3.select(className);
  const rect = svg.node().getBoundingClientRect();
  const width = parseInt(rect.width);
  const height = parseInt(rect.height);

  // create a color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const creditsScale = d3.scaleLinear().domain([1, 5]).range([3, 15]);
  // create a force simulation

  // add initial positions
  const nodesDict = convertToDict(nodesData);
  let courseOrder = topologicalSort(nodesDict);
  const y_padding = 50;
  let nodeSpacing = (height - 2 * y_padding) / (courseOrder.length - 1); // width is the width of your SVG or canvas

  for (let i = 0; i < courseOrder.length; i++) {
    let course = courseOrder[i];
    nodesDict[course].initialY = y_padding + nodeSpacing * i;
  }
  nodesData.forEach(node => {
    node.y = nodesDict[node.id].initialY;
  });


  const SOME_THRESHOLD = 50;
  const SOME_REPULSION_STRENGTH = 1;
  function customForces(nodes, links, alpha) {
    // Iterate over all nodes
    nodes.forEach(function (node) {
      // Repulsion between node and edge
      links.forEach(function (link) {
        // Calculate a point on the link (e.g., the midpoint)
        let mx = (link.source.x + link.target.x) / 2;
        let my = (link.source.y + link.target.y) / 2;

        let dx = mx - node.x;
        let dy = my - node.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SOME_THRESHOLD) {
          // Calculate the repulsion force and apply it
          let force = SOME_REPULSION_STRENGTH * alpha;
          node.vx -= force * (dx / dist);
          node.vy -= force * (dy / dist);
        }
      });
    });

    // // Additional force to repel link midpoints from each other
    // links.forEach(function (linkA) {
    //   let mxA = (linkA.source.x + linkA.target.x) / 2;
    //   let myA = (linkA.source.y + linkA.target.y) / 2;

    //   links.forEach(function (linkB) {
    //     if (linkA === linkB) return;

    //     let mxB = (linkB.source.x + linkB.target.x) / 2;
    //     let myB = (linkB.source.y + linkB.target.y) / 2;

    //     let dx = mxB - mxA;
    //     let dy = myB - myA;
    //     let dist = Math.sqrt(dx * dx + dy * dy);

    //     if (dist < SOME_THRESHOLD) {
    //       let force = (SOME_REPULSION_STRENGTH * alpha) / dist;
    //       let fx = force * (dx / dist);
    //       let fy = force * (dy / dist);

    //       // Apply the repulsion force to the link endpoints
    //       linkA.source.vx -= fx / 2;
    //       linkA.source.vy -= fy / 2;
    //       linkA.target.vx += fx / 2;
    //       linkA.target.vy += fy / 2;

    //       linkB.source.vx += fx / 2;
    //       linkB.source.vy += fy / 2;
    //       linkB.target.vx -= fx / 2;
    //       linkB.target.vy -= fy / 2;
    //     }
    //   });
    // });
  }

  const minThreshold = 300;
  // const maxThreshold = 300;
  const minDistance = 100;
  const strengthRepulsion = 30;
  const strengthAttraction = 22;
  const simulation = d3
    .forceSimulation(nodesData)
    .force(
      "link",
      d3
        .forceLink(linksData)
        .id((d) => d.id)
        .distance(100)
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

    .force("collide", d3.forceCollide(48))
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.3))
    .force(
      "y",
      d3.forceY().y((d) => nodesDict[d.id].initialY)
    ).alphaDecay(0.05);

  const arrowHeight = 3;
  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"]) // Different link/path types can be defined here
    .enter()
    .append("marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 0 6 6")
    .attr("refX", 0) // Controls the shift of the arrowhead along the path
    .attr("refY", 3)
    .attr("markerWidth", 3)
    .attr("markerHeight", arrowHeight)
    .attr("orient", "auto")
    .attr("fill", "#888")
    .append("svg:path")
    .attr("d", "M 6 0 L 0 3 L 6 6 z");

  // define filters
  const defs = svg.append("defs");

  const filter = defs
    .append("filter")
    .attr("id", "halo")
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
    .attr("opacity", (node) =>
      selectedNodes.some((selected) => selected.id === node.id) ? 1 : 0.4
    ) // Initial opacity for all nodes
    .style("filter", (node) =>
      selectedNodes.some((selected) => selected.id === node.id)
        ? "url(#halo)"
        : null
    )
    .attr("r", (d) => creditsScale(d.credits))
    .attr("cx", (d) => d.x)
    .attr("cy", height / 2)
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
    })
    .on("contextmenu", function (event, d) {
      // When the mouse goes over a node
      console.log("right clicked on node", d.id);
      event.preventDefault();
      // TODO: show something
    });

  let nodeLegendData = color.domain().sort().map((d) => ({
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
    .attr("stroke-width", 2)
    .attr("marker-start", "url(#end)")
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
    customForces(nodesData, linksData, 1); // not very useful
    nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labels.attr("x", (d) => d.x + 50).attr("y", (d) => d.y);
    links
      .attr(
        "x1",
        (d) =>
          d.source.x +
          creditsScale(d.source.credits) *
            Math.cos(
              Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)
            )
      )
      .attr(
        "y1",
        (d) =>
          d.source.y +
          creditsScale(d.source.credits) *
            Math.sin(
              Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)
            )
      )
      .attr(
        "x2",
        (d) =>
          d.target.x -
          (creditsScale(d.target.credits)) *
            Math.cos(
              Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)
            )
      )
      .attr(
        "y2",
        (d) =>
          d.target.y -
          (creditsScale(d.target.credits)) *
            Math.sin(
              Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)
            )
      );
  });

  // add drag functions
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(.2).restart();
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
