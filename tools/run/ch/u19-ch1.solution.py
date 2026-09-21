def fit_slope(xs, ys):
    if len(xs) != len(ys):
        raise ValueError("xs و ys لازم نفس الطول")
    sum_xx = sum(x * x for x in xs)
    if sum_xx == 0:
        raise ValueError("كل قيم x أصفار")
    sum_xy = sum(x * y for x, y in zip(xs, ys))
    return sum_xy / sum_xx

def predict(w, x):
    return w * x
