matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = []
for row in matrix:
    for x in row:
        flat.append(x)
print(flat)
flat2 = [x for row in matrix for x in row]
print(flat2)
print(flat == flat2)
