from collections import Counter
week1 = Counter({"قهوة": 5, "شاي": 3})
week2 = Counter({"قهوة": 2, "عصير": 4})
print(week1 + week2)
print(week1 - week2)
print(week1.total())
week1.update(["شاي", "شاي"])
print(week1["شاي"])
