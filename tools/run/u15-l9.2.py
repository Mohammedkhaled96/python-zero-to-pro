from dataclasses import dataclass
@dataclass
class Point:
    x: float
    y: float
p = Point(1, 2)
print(p)
print(p == Point(1, 2))
p.x = 10
print(p.x)
print(Point(y=5, x=3))
