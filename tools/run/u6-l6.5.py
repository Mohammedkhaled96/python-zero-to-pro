numbers = [3, 0, 7, -2, 5]
for n in numbers:
    if n == 0:
        continue
    if n < 0:
        print("أول سالب:", n)
        break
    print(n)
