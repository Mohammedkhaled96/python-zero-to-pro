matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
evens = [x for row in matrix for x in row if x % 2 == 0]
print(evens)
table = [[r * c for c in range(1, 4)] for r in range(1, 4)]
print(table)
transposed = [[row[i] for row in matrix] for i in range(3)]
print(transposed)
pairs = [(color, size) for color in ["أحمر", "أزرق"] for size in ["S", "M"]]
print(pairs)
