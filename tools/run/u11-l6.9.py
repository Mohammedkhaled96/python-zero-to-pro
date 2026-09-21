def make_discount(percent: float):
    def apply(price: float) -> float:
        return round(price * (1 - percent / 100), 2)
    return apply
black_friday = make_discount(30)
students = make_discount(10)
print(black_friday(500), students(500))
