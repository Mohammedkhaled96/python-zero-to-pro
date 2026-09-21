class Student:
    courses = []

    def __init__(self, name):
        self.name = name

    def enroll(self, course):
        self.courses.append(course)
