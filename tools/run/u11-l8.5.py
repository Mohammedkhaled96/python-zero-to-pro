data = [4, 8, 15, 16, 23, 42]
if (n := len(data)) > 5:
    print(f"القائمة طويلة: {n} عناصر")
values = [y for x in data if (y := x * 2) > 20]
print(values)
