grid = [[0] * 3] * 3
grid[0][0] = 99
print(grid)
print(grid[0] is grid[1])
good = [[0] * 3 for _ in range(3)]
good[0][0] = 99
print(good)
print(good[0] is good[1])
