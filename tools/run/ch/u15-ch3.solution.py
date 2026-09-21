import math

class Shape:
    def area(self):
        raise NotImplementedError("كل شكل لازم يعرّف area")

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h

    def area(self):
        return self.w * self.h

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return math.pi * self.r ** 2

def total_area(shapes):
    return sum(shape.area() for shape in shapes)
