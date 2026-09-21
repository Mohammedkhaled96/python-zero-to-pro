import csv
line = 'أحمد,"الإسكندرية, العجمي",78'
print(line.split(","))
print(next(csv.reader([line])))
