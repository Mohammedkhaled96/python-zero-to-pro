print(ZeroDivisionError.__mro__)
print(issubclass(FileNotFoundError, OSError))
try:
    1 / 0
except ArithmeticError as e:
    print("اتمسك بالأب:", type(e).__name__)
