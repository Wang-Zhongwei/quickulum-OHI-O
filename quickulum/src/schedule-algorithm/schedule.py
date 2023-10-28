from collections import defaultdict, deque
import heapq

def can_take_course(course, prerequisites, completed_courses):
    if not prerequisites[course]:
        return True
    for prereq_group in prerequisites[course]:
        if any(prereq in completed_courses for prereq in prereq_group):
            continue
        else:
            return False
    return True

def shortest_path_to_graduating(courses, prerequisites={}, max_credit_hours=18):
    graph = defaultdict(list)
    in_degree = defaultdict(int)
    course_credit = defaultdict(int)
    completed_courses = set()
    available_courses = []

    for course, credit in courses.items():
        course_credit[course] = credit

    for course, prereq_list in prerequisites.items():
        if not prereq_list:
            heapq.heappush(available_courses, (0, course))
        else:
            for prereq_group in prereq_list:
                for prereq in prereq_group:
                    graph[prereq].append(course)
                    in_degree[course] += 1

    semesters = []

    while available_courses:
        current_semester = []
        current_credit_hours = 0
        next_semester_courses = []

        while available_courses and current_credit_hours < max_credit_hours:
            _, course = heapq.heappop(available_courses)
            credit = course_credit[course]
            if current_credit_hours + credit <= max_credit_hours and can_take_course(course, prerequisites, completed_courses):
                current_semester.append(course)
                current_credit_hours += credit
                completed_courses.add(course)
                for next_course in graph[course]:
                    in_degree[next_course] -= 1
                    if in_degree[next_course] == 0:
                        next_semester_courses.append(next_course)
                        
        for next_course in next_semester_courses:
            heapq.heappush(available_courses, (len(prerequisites[next_course]), next_course))
        
        if current_semester:
            semesters.append(current_semester)

    return semesters





# Given data
courses = {
    'CSE1223': 3,
    'CSE2221': 4,
    'CSE2231': 3,
    'CSE2321': 3,
    'CSE2331': 3,
    'CSE2421': 3,
    'CSE2431': 3,
    'CSE3241': 3,
    'CSE3341': 3,
    'CSE5234': 3,
    'CSE4253': 3,
    'CSE4252': 3,
    'CSE3521': 3,
    'CSE3901': 3,
    'CSE3902': 3,
    'CSE4471': 3,
    'CSE5235': 3,
    'CSE5242': 3,
    'CSE5441': 3,
    'CSE5523': 3,
    'CSE5539': 3,
}

prerequisites = {
    'CSE1223': [],
    'CSE2221': [['CSE1223']],
    'CSE2231': [['CSE2221']],
    'CSE2321': [['CSE1223']],
    'CSE2331': [['CSE2221', 'CSE1223']],
    'CSE2421': [['CSE2231']],
    'CSE2431': [['CSE2421'], ['CSE2331']],
    'CSE3241': [['CSE2231'], ['CSE2331']],
    'CSE3341': [['CSE2331']],
    'CSE5234': [['CSE3241'], ['CSE2231', 'CSE2321']],
    'CSE4253': [['CSE3241'], ['CSE2421', 'CSE2431']],
    'CSE4252': [['CSE4253']],
    'CSE3521': [['CSE2331'], ['CSE2421']],
    'CSE3901': [['CSE2231', 'CSE2321']],
    'CSE3902': [['CSE3901']],
    'CSE4471': [['CSE2231'], ['CSE2331']],
    'CSE5235': [['CSE3341'], ['CSE2431']],
    'CSE5242': [['CSE3241'], ['CSE4253']],
    'CSE5441': [['CSE2231'], ['CSE2331']],
    'CSE5523': [['CSE3241']],
    'CSE5539': [['CSE5234', 'CSE3241'], ['CSE4253']],
}

# Test
result = shortest_path_to_graduating(courses, prerequisites)
print(result)
