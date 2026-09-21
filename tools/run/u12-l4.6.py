import csv
with open("students.csv", encoding="utf-8", newline="") as src, \
     open("top.csv", "w", encoding="utf-8", newline="") as dst:
    reader = csv.DictReader(src)
    writer = csv.DictWriter(dst, fieldnames=reader.fieldnames)
    writer.writeheader()
    for row in reader:
        if int(row["score"]) >= 80:
            writer.writerow(row)
with open("top.csv", encoding="utf-8") as f:
    print(f.read())
