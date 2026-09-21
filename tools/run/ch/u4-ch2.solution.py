year = int(input("السنة: "))
if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
    print("كبيسة")
else:
    print("مش كبيسة")
