from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p)
print(p.x, p[1])
x, y = p
print(x + y)
Student = namedtuple("Student", "name grade city")
s = Student("سارة", 95, "الجيزة")
print(s.name, s.grade)
print(s._replace(grade=97))
