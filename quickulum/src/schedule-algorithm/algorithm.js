// Algorithm by Rohan "RJ" Jaiswal
// Adapted from chaudhary1337's solution on Leetcode 1494

function generateSchedule(json) {
  const graph = {};
  const visited = {};
  const schedule = [];

  for (const [courseName, courseData] of Object.entries(cseJson)) {
    const dependencies = courseData.dependencies || [];
    graph[courseName] = dependencies;
    visited[courseName] = 0;
  }

  const creditSum = (nodes, courseJson) => {
    return nodes.reduce((acc, course) => acc + courseJson[course].credits, 0);
  };

  const inDegrees = {};
  for (const [course, dependencies] of Object.entries(graph)) {
    for (const row of dependencies) {
      for (const prereq of row) {
        inDegrees[prereq] = (inDegrees[prereq] || 0) + 1;
      }
    }
  }

  const recurse = (graph, visited, inDegrees, creditMax, courseJson) => {
    if (!Object.values(inDegrees).some((value) => value > 0)) return;

    const nodes = Object.fromEntries(
      Object.entries(graph).filter(
        ([course]) => visited[course] === 0 && (inDegrees[course] || 0) === 0
      )
    );

    const selected = {};
    while (
      Object.keys(nodes).length > 0 &&
      creditSum(Object.keys(selected), courseJson) < 18
    ) {
      const course = Object.keys(nodes).pop();
      const dependencies = nodes[course];
      delete nodes[course];

      const proposedHours =
        creditSum(Object.keys(selected), courseJson) +
        courseJson[course].credits;
      if (proposedHours > 18) break;
      selected[course] = dependencies;
    }

    const semester = [];
    for (const [course, dependencies] of Object.entries(selected)) {
      semester.push(course);
      visited[course] = 1;
      for (const row of dependencies) {
        for (const course of row) {
          inDegrees[course] -= 1;
        }
      }
    }
    schedule.unshift(semester);
    recurse(graph, visited, inDegrees, creditMax, courseJson);
  };

  recurse(graph, visited, inDegrees, 18, cseJson);
  return schedule;
}

let cseJson = [
  {
    id: "CSE-1111",
    title: "Introduction to Computer-Assisted Problem Solving",
    credits: 3,
    dependencies: [[]],
    index: 6,
    x: 18.448930116910113,
    y: 446.8596943623432,
    vy: -0.0005417828182123536,
    vx: 0.0018119697398425217,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-3903",
    title: "",
    credits: 3,
    dependencies: [],
    index: 52,
    x: 687.1921566017883,
    y: 493.1512106868212,
    vy: -0.0013904725473671184,
    vx: 0.00034410935719766944,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-1212",
    title: "",
    credits: 3,
    dependencies: [],
    index: 49,
    x: 876.0397272780199,
    y: 558.1853753219311,
    vy: -0.0027320483537061303,
    vx: 0.007404117523360582,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-1211",
    title: "",
    credits: 3,
    dependencies: [],
    index: 48,
    x: 820.6886274147026,
    y: 130.31315639233839,
    vy: -0.0020496569533001103,
    vx: 0.0016100020563510754,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-1110",
    title: "Introduction to Computing Technology",
    credits: 3,
    dependencies: [[]],
    index: 9,
    x: 135.74333924521812,
    y: 608.8491748061853,
    vy: -0.00023467887581850563,
    vx: 0.0015302667298796363,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-5526",
    title: "Introduction to Neural Networks",
    credits: 3,
    dependencies: [["CSE-3521", "CSE-5521"]],
    index: 35,
    x: 554.2702929470873,
    y: 641.1283404410567,
    vy: 0.002909755023780922,
    vx: 0.003631749532629529,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-2123",
    title: "",
    credits: 3,
    dependencies: [],
    index: 46,
    x: 1045.848807006715,
    y: 525.1393691132794,
    vy: -0.00569863352810101,
    vx: 0.011823890463261927,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-2501",
    title: "Social, Ethical, and Professional Issues in Computing",
    credits: 1,
    dependencies: [["CSE-2122", "CSE-2123", "CSE-2231"]],
    index: 14,
    x: 895.0419930365475,
    y: 656.2688489393464,
    vy: -0.001212156663815117,
    vx: 0.010902830642919999,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-5521",
    title: "",
    credits: 3,
    dependencies: [],
    index: 59,
    x: 478.5213083976958,
    y: 531.2094591229229,
    vy: -0.0006700935958448274,
    vx: 0.00391079441187722,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-3541",
    title: "",
    credits: 3,
    dependencies: [],
    index: 60,
    x: 517.949416491203,
    y: 763.3589800916776,
    vy: -0.0015107677936882795,
    vx: 0.0025344402038031686,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-5541",
    title: "",
    credits: 3,
    dependencies: [],
    index: 61,
    x: 282.907901565517,
    y: 736.3735875720615,
    vy: -0.0017399511214315525,
    vx: 0.00221825439284076,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-5545",
    title: "Advanced Computer Graphics",
    credits: 3,
    dependencies: [["CSE-3541", "CSE-5541"]],
    index: 37,
    x: 407.2425518996437,
    y: 700.0551915548333,
    vy: -0.001227426579098064,
    vx: 0.00239351100250701,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-2122",
    title: "",
    credits: 3,
    dependencies: [],
    index: 45,
    x: 1215.8578506931324,
    y: 492.14793078359656,
    vy: -0.009938180281549976,
    vx: 0.011582757728530346,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-2431",
    title: "",
    credits: 3,
    dependencies: [],
    index: 54,
    x: 1140.3872110296259,
    y: 557.735230148846,
    vy: -0.008218362232942499,
    vx: 0.012692706398804288,
    fx: null,
    fy: null,
  },
  {
    id: "CSE-3430",
    title: "",
    credits: 3,
    dependencies: [],
    index: 53,
    x: 1177.7084735397111,
    y: 295.850325031472,
    vy: -0.009944567873632114,
    vx: 0.00795053531003133,
    fx: null,
    fy: null,
  },
];


const schedule = generateSchedule(cseJson);
console.log(schedule);
// export default generateSchedule;
