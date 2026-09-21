n = 29
for d in range(2, n):
    if n % d == 0:
        print(f"{n} مش أولي — بيقبل القسمة على {d}")
        break
else:
    print(f"{n} عدد أولي")
