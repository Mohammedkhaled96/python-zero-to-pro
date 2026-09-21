try:
    a = float(input("الأول: "))
    b = float(input("التاني: "))
    print(f"الناتج: {round(a / b, 2)}")
except ValueError:
    print("لازم تدخل أرقام")
except ZeroDivisionError:
    print("مينفعش القسمة على صفر")
