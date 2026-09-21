def fit_slope(xs, ys):
    best_w, best_error = 0, float("inf")
    for step in range(0, 301):
        w = step / 10
        error = sum((w * x - y) ** 2 for x, y in zip(xs, ys))
        if error < best_error:
            best_w, best_error = w, error
    return best_w

def predict(w, x):
    return w * x
