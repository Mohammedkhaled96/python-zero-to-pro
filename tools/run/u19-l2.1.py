areas = [50, 80, 100, 120, 150]
prices = [520, 790, 1010, 1180, 1530]
best_w, best_error = None, float("inf")
for step in range(50, 151):
    w = step / 10
    error = sum((w * a - p) ** 2 for a, p in zip(areas, prices))
    if error < best_error:
        best_w, best_error = w, error
print(f"الآلة اتعلّمت: السعر ≈ {best_w} × المساحة")
print(f"توقّع لشقة 90 متر: {best_w * 90:.0f} ألف")
