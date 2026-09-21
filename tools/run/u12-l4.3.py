import csv
with open("students.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        name, city, score = row
        print(f"{name}: {int(score) + 5}")
