grid = [[3, 8, 1], [9, 4, 7], [5, 6, 2]]
target = 4
found = False
for r, row in enumerate(grid):
    for c, value in enumerate(row):
        if value == target:
            found = True
            break
    if found:
        break
print(f"الصف {r} العمود {c}" if found else "مش موجود")
