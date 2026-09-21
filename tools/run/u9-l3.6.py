try:
    [1, 2][5]
except IndexError as e:
    print(type(e).__name__)
try:
    {"a": 1}["b"]
except KeyError as e:
    print(type(e).__name__, e)
try:
    "5" + 5
except TypeError as e:
    print(type(e).__name__)
try:
    print(undefined_name)
except NameError as e:
    print(type(e).__name__)
