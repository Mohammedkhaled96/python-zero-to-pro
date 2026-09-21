values = input("القيم: ").split()
total = 0
rejected = []
for v in values:
    try:
        total += int(v)
    except ValueError:
        rejected.append(v)
print(f"المجموع: {total}")
print(f"المرفوض: {', '.join(rejected) if rejected else 'لا يوجد'}")
