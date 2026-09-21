def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply
double = make_multiplier(2)
triple = make_multiplier(3)
print(double(10), triple(10))
print(double.__closure__[0].cell_contents)
