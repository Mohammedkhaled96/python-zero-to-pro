def linear_ops(n):
    ops = 0
    for i in range(n):
        ops += 1
    return ops
def pairs_ops(n):
    ops = 0
    for i in range(n):
        for j in range(n):
            ops += 1
    return ops
for n in [10, 20, 40]:
    print(n, linear_ops(n), pairs_ops(n))
