readings = ["21.5", "ERR", "23", "", "22.5", "n/a"]
good = []
bad = 0
for r in readings:
    try:
        good.append(float(r))
    except ValueError:
        bad += 1
print("سليم:", good)
print("بايظ:", bad)
print("المتوسّط:", sum(good) / len(good))
