<!-- @format -->
<template>
  <div>
    <h1>Course dependency graph at OSU</h1>
    <svg id="graph" width="960" height="960"></svg>
  </div>
</template>

<script lang="ts" setup>
import drawGraph from "./course_graph.js";
import { onMounted } from "vue";
const nodes = [
  { id: "Math 1310", title: "Calculus I", credits: 4 },
  { id: "Math 1320", title: "Calculus II", credits: 4 },
  { id: "Math 2310", title: "Calculus III", credits: 4 },
  { id: "CSE 2330", title: "Discrete Math", credits: 3 },
  { id: "CSE 2100", title: "Data Structure", credits: 3 },
  { id: "CSE 2200", title: "C", credits: 3 },
  { id: "CSE 2300", title: "Python", credits: 3 },
  { id: "CSE 3100", title: "Algorithms", credits: 3 },
  { id: "CSE 3200", title: "C++", credits: 3 },
  { id: "CSE 4100", title: "Operating Systems", credits: 3 },
];

const links = [
  { source: "Math 1310", target: "Math 1320", type: "prereq", group: 0 },
  { source: "Math 1320", target: "Math 2310", type: "coreq", group: 0 },
  { source: "Math 2310", target: "CSE 2330", type: "prereq", group: 0 },
  { source: "CSE 2330", target: "CSE 2100", type: "prereq", group: 0 },
  { source: "CSE 2100", target: "CSE 2200", type: "prereq", group: 0 },
  { source: "CSE 2100", target: "CSE 2300", type: "prereq", group: 0 },
  { source: "CSE 2100", target: "CSE 3100", type: "prereq", group: 0 },
  { source: "CSE 2100", target: "CSE 3200", type: "prereq", group: 0 },
  { source: "CSE 3100", target: "CSE 4100", type: "prereq", group: 0 },
  { source: "Math 1320", target: "CSE 2330", type: "prereq", group: 1 },
];
onMounted(() => {
  console.log("mounted");
  drawGraph(nodes, links);
});
</script>