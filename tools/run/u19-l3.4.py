train = [
    (150, 8, "برتقان"), (170, 9, "برتقان"), (140, 7, "برتقان"),
    (120, 2, "تفاح"), (130, 3, "تفاح"), (110, 1, "تفاح"),
]
def distance(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
def classify(point):
    nearest = min(train, key=lambda row: distance(row, point))
    return nearest[2]
print(classify((160, 8)))
print(classify((115, 2)))
test = [(155, 9, "برتقان"), (125, 2, "تفاح"), (135, 6, "برتقان")]
correct = sum(1 for point in test if classify(point) == point[2])
print(f"الدقّة: {correct}/{len(test)}")
