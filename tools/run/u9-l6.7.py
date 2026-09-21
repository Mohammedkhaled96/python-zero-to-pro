prices = ["10", "20", "x", "30"]
total = 0
bad = []
for p in prices:
    try:
        total += int(p)
    except ValueError:
        bad.append(p)
print(total, bad)
