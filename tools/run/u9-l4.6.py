pairs = [("10", "2"), ("7", "0"), ("x", "3")]
for a, b in pairs:
    try:
        result = int(a) / int(b)
    except ZeroDivisionError:
        print("ما ينفعش تقسم على صفر")
    except ValueError:
        print("لازم أرقام")
    else:
        print("الناتج:", result)
    finally:
        print("--")
