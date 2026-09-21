count = 0
def local_only():
    count = 99
    return count
def with_global():
    global count
    count += 1
def cleaner(value):
    return value + 1
print(local_only(), count)
with_global()
print(count)
count = cleaner(count)
print(count)
