import math

def test_perfect_line():
    "y = 2x بالظبط ← 2"
    assert math.isclose(fit_slope([1, 2, 3], [2, 4, 6]), 2)

def test_houses_exact():
    "بيانات الشقق ← 10.0591… (مش 10.1 التقريبية)"
    w = fit_slope([50, 80, 100, 120, 150], [520, 790, 1010, 1180, 1530])
    assert math.isclose(w, 561300 / 55800), f"w = {w}"

def test_negative():
    "ميل سالب ← -3"
    assert math.isclose(fit_slope([1, 2], [-3, -6]), -3)

def test_predict():
    "predict(2.5, 4) ← 10"
    assert math.isclose(predict(2.5, 4), 10)

def test_invalid():
    "أطوال مختلفة أو x كلها أصفار ← ValueError"
    for xs, ys in [([1, 2], [1]), ([0, 0], [1, 2])]:
        try:
            fit_slope(xs, ys)
        except ValueError:
            continue
        raise AssertionError(f"fit_slope({xs}, {ys}) ما رمتش ValueError")
