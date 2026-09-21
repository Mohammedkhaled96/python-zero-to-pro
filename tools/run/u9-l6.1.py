values = ["10", "-3", "4.5", "abc", "", " 7 "]
numbers = []
for v in values:
    s = v.strip()
    if s.lstrip("-").isdecimal():
        numbers.append(int(s))
print(numbers)
