students = [("سارة", "أ"), ("أحمد", "ب"), ("منى", "أ"), ("علي", "ج"), ("خالد", "ب")]
manual = {}
for name, cls in students:
    if cls not in manual:
        manual[cls] = []
    manual[cls].append(name)
print(manual)
