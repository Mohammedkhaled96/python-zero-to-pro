n = int(input("لحد كام؟ "))
for i in range(1, n):
    total = 0
    if i % 2 == 0:
        total += i
print(f"مجموع الزوجي: {total}")
