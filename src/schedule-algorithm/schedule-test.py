import unittest
from schedule1 import shortest_path_to_graduating

class TestCourseScheduling(unittest.TestCase):

    def test_scenario_1(self):
        courses = {
            'MATH101': 3, 'PHYS101': 4, 'CHEM101': 3, 'ENG101': 3,
            'CS101': 3, 'CS102': 3, 'CS201': 3, 'CS301': 3,
            'CS401': 3, 'CS402': 3, 'CS403': 3
        }
        prerequisites = {
            'MATH101': [], 'PHYS101': [['MATH101']], 'CHEM101': [],
            'ENG101': [], 'CS101': [], 'CS102': [['CS101']],
            'CS201': [['CS101', 'CS102']], 'CS301': [['CS201']],
            'CS401': [['CS301']], 'CS402': [['CS401']], 'CS403': [['CS402']]
        }
        self.run_test(courses, prerequisites, max_credit_hours=9)

    def test_scenario_2(self):
        courses = {
            'MATH201': 4, 'PHYS201': 4, 'CHEM201': 3, 'ENG201': 3,
            'CS201': 3, 'CS202': 3, 'CS301': 3, 'CS401': 3,
            'CS402': 3, 'CS403': 3
        }
        prerequisites = {
            'MATH201': [], 'PHYS201': [['MATH201']], 'CHEM201': [],
            'ENG201': [], 'CS201': [], 'CS202': [['CS201']],
            'CS301': [['CS201', 'CS202']], 'CS401': [['CS301']],
            'CS402': [['CS401']], 'CS403': [['CS402']]
        }
        self.run_test(courses, prerequisites, max_credit_hours=10)

    def test_scenario_3(self):
        courses = {
            'MATH301': 4, 'PHYS301': 3, 'CHEM301': 3, 'ENG301': 3,
            'CS301': 3, 'CS302': 3, 'CS401': 3, 'CS402': 3,
            'CS403': 3, 'CS404': 3
        }
        prerequisites = {
            'MATH301': [], 'PHYS301': [['MATH301']], 'CHEM301': [],
            'ENG301': [], 'CS301': [], 'CS302': [['CS301']],
            'CS401': [['CS301', 'CS302']], 'CS402': [['CS401']],
            'CS403': [['CS402']], 'CS404': [['CS403']]
        }
        self.run_test(courses, prerequisites, max_credit_hours=12)

    def run_test(self, courses, prerequisites, max_credit_hours):
        result = shortest_path_to_graduating(courses, prerequisites, max_credit_hours)
        completed_courses = set()
        for semester in result:
            total_credits = 0
            for course in semester:
                self.assertTrue(can_take_course(course, prerequisites, completed_courses))
                completed_courses.add(course)
                total_credits += courses[course]
            self.assertLessEqual(total_credits, max_credit_hours)
        self.assertEqual(completed_courses, set(courses.keys()))

def can_take_course(course, prerequisites, completed_courses):
    if not prerequisites[course]:
        return True
    for prereq_group in prerequisites[course]:
        if all(prereq in completed_courses for prereq in prereq_group):
            return True
    return False

if __name__ == '__main__':
    unittest.main()
