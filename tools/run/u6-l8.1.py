numbers = [7, 11, 13, 15, 17]
for n in numbers:
    if n % 5 == 0:
        print(f"أول مضاعف لـ 5: {n}")
        break
else:
    print("مفيش ولا رقم بيقبل القسمة على 5")
