from collections import defaultdict, deque

def shortest_path_to_graduating(credit_hours, prerequisites={}, max_credit_hours=18):
    # Step 1: Create the graph
    graph = defaultdict(list)
    in_degree = defaultdict(int)
    extra_nodes = 0

    for course, prereqs in prerequisites.items():
        for sublist in prereqs:
            extra_node = f'extra{extra_nodes}'
            extra_nodes += 1
            graph[extra_node].append(course)
            in_degree[course] += 1
            for prereq in sublist:
                graph[prereq].append(extra_node)
                in_degree[extra_node] += 1

    # Add courses with no prerequisites
    for course in credit_hours:
        if course not in in_degree:
            in_degree[course] = 0

    # Step 2: Topological Sort
    queue = deque([node for node in in_degree if in_degree[node] == 0])
    semesters = []
    current_semester = []
    current_credit_hours = 0

    while queue:
        course = queue.popleft()
        # Skip extra nodes created for handling complex prerequisites
        if course.startswith('extra'):
            continue
        
        # Check if adding the course would exceed the maximum credit hours
        if current_credit_hours + credit_hours[course] > max_credit_hours:
            semesters.append(current_semester)
            current_semester = []
            current_credit_hours = 0
        
        current_semester.append(course)
        current_credit_hours += credit_hours[course]

        for next_course in graph[course]:
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)
    
    if current_semester:
        semesters.append(current_semester)

    return semesters
