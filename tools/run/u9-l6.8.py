raw = ["25", "17", "abc", "45", "70", " 33"]
accepted = []
rejected = []
for r in raw:
    try:
        age = int(r)
    except ValueError:
        rejected.append(r)
        continue
    if 18 <= age <= 60:
        accepted.append(age)
    else:
        rejected.append(r)
print("مقبول:", accepted)
print("مرفوض:", rejected)
