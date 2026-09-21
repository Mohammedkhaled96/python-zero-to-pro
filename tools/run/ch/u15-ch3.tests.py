import math

def test_rectangle():
    "Rectangle(3, 4).area() ← 12"
    assert Rectangle(3, 4).area() == 12

def test_circle():
    "Circle(1).area() ← π"
    assert math.isclose(Circle(1).area(), math.pi)

def test_inheritance():
    "الاتنين أبناء Shape"
    assert isinstance(Rectangle(1, 1), Shape) and isinstance(Circle(1), Shape)

def test_base_not_implemented():
    "Shape().area() ← NotImplementedError"
    try:
        Shape().area()
    except NotImplementedError:
        return
    raise AssertionError("المفروض NotImplementedError")

def test_total():
    "total_area بتجمع أشكال مختلفة"
    shapes = [Rectangle(2, 5), Circle(2), Rectangle(1, 1)]
    assert math.isclose(total_area(shapes), 11 + 4 * math.pi)
