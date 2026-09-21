not_tuple = (5)
real_tuple = (5,)
print(type(not_tuple).__name__, type(real_tuple).__name__)
also_tuple = 1, 2, 3
print(also_tuple)
print(len(()))
box = ([1, 2], "x")
box[0].append(3)
print(box)
try:
    hash(box)
except TypeError as e:
    print("TypeError:", e)
print(hash((1, 2)) == hash((1, 2)))
point = (3, 4, 3)
print(point.count(3), point.index(4))
