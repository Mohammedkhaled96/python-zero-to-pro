values = ["10", "-3", "4.5", "abc", "", " 7 ", "--3"]
numbers = []
for v in values:
    try:
        numbers.append(int(v))
    except ValueError:
        pass
print(numbers)
