import csv
with open("students.csv", encoding="utf-8", newline="") as f:
    students = list(csv.DictReader(f))
print(students[0])
top = max(students, key=lambda s: int(s["score"]))
print(top["name"], top["score"])
avg = sum(int(s["score"]) for s in students) / len(students)
print(f"المتوسط: {avg:.1f}")
