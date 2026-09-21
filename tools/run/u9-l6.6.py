prices = ["10", "20", "x", "30"]
total = 0
try:
    for p in prices:
        total += int(p)
except ValueError:
    print("فيه سعر غلط")
print(total)
