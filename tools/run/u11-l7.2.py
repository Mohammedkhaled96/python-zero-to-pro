colors = ["أحمر", "أخضر", "أزرق"]
it = iter(colors)
while True:
    try:
        color = next(it)
    except StopIteration:
        break
    print(color)
