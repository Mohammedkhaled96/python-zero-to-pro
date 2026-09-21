from collections import defaultdict
students = [("سارة", "أ"), ("أحمد", "ب"), ("منى", "أ"), ("علي", "ج"), ("خالد", "ب")]
by_class = defaultdict(list)
for name, cls in students:
    by_class[cls].append(name)
print(dict(by_class))
stock = defaultdict(int)
stock["قلم"] += 10
print(stock["كشكول"])
print(dict(stock))
print("مسطرة" in stock)
