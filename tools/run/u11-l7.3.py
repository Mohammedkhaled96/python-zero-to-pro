def countdown(n):
    print("بدأنا")
    while n > 0:
        yield n
        n -= 1
    print("خلصنا")
gen = countdown(3)
print(type(gen))
print(next(gen))
print(next(gen))
for value in gen:
    print(value)
