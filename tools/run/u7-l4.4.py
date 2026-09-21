from fractions import Fraction
a = Fraction(1, 3)
b = Fraction(1, 6)
print(a + b)
print(a * 3)
print(Fraction("0.75"))
print(float(Fraction(22, 7)))
print(Fraction(0.1).limit_denominator(100))
