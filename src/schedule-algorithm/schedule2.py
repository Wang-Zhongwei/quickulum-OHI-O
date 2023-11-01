from collections import defaultdict, deque

def shortest_path_to_graduating(courses, prerequisites={}, max_credit_hours=18):
    # Step 1: Create the graph and in-degree dictionary
    graph = defaultdict(list)
    in_degree = defaultdict(int)
    prereq_mapping = defaultdict(list)

    for course, prereqs in prerequisites.items():
        for prereq_list in prereqs:
            for prereq in prereq_list:
                graph[prereq].append((course, prereq_list))
                in_degree[course] += 1
                prereq_mapping[course].append(set(prereq_list))

    # Add courses with no prerequisites
    for course in courses:
        if course not in in_degree:
            in_degree[course] = 0

    # Step 2: Topological Sort
    queue = deque([course for course in in_degree if in_degree[course] == 0])
    semesters = []
    current_semester = []
    current_credit_hours = 0

    while queue:
        course = queue.popleft()
        credit_hours = courses[course]

        # Check if adding the course would exceed the maximum credit hours
        if current_credit_hours + credit_hours > max_credit_hours:
            semesters.append(current_semester)
            current_semester = []
            current_credit_hours = 0
        
        current_semester.append(course)
        current_credit_hours += credit_hours

        for next_course, prereq_list in graph[course]:
            prereq_mapping[next_course].remove(set(prereq_list))
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)

    if current_semester:
        semesters.append(current_semester)

    return semesters

