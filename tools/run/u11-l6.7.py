from functools import partial, reduce
def power(base, exp):
    return base ** exp
square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(5), cube(2))
print_csv = partial(print, sep=",")
print_csv("a", "b", "c")
total = reduce(lambda acc, n: acc + n, [1, 2, 3, 4])
print(total)
longest = reduce(lambda a, b: a if len(a) >= len(b) else b, ["hi", "hello", "hey"])
print(longest)
