import csv
rows = [
    ["name", "city", "score"],
    ["سارة", "القاهرة", 91],
    ["أحمد", "الإسكندرية, العجمي", 78],
    ["منى", "طنطا", 85],
]
with open("students.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerows(rows)
with open("students.csv", encoding="utf-8") as f:
    print(f.read())
