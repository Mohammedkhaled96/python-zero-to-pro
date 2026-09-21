a = [1, 2]
b = a
b.append(3)
print(a, a is b)
c = a.copy()
c.append(4)
print(a, c, a is c)
x = 10
y = x
y = y + 1
print(x, y)
