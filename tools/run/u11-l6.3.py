nums = [1, 2, 3, 4, 5, 6]
print(list(map(lambda n: n * n, nums)))
print([n * n for n in nums])
print(list(filter(lambda n: n % 2 == 0, nums)))
print(list(map(int, ["10", "20", "30"])))
print(list(map(str.strip, [" a ", "b  "])))
print(list(filter(None, ["", "x", 0, 5, None])))
