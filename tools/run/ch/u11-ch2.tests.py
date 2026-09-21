def test_default():
    "apply_discount(200) ← 180.0"
    assert apply_discount(200) == 180.0

def test_percent():
    "apply_discount(200, 25) ← 150.0"
    assert apply_discount(200, 25) == 150.0

def test_rounding():
    "apply_discount(9.99, 15) ← 8.49"
    assert apply_discount(9.99, 15) == 8.49, apply_discount(9.99, 15)

def test_min_price():
    "مش أقل من min_price: apply_discount(100, 90, min_price=50) ← 50"
    assert apply_discount(100, 90, min_price=50) == 50

def test_invalid():
    "نسبة 120 أو -5 ← ValueError"
    for bad in (120, -5):
        try:
            apply_discount(100, bad)
        except ValueError:
            continue
        raise AssertionError(f"النسبة {bad} ما رمتش ValueError")

def test_keyword_only():
    "min_price بالاسم بس: apply_discount(100, 10, 50) ← TypeError"
    try:
        apply_discount(100, 10, 50)
    except TypeError:
        return
    raise AssertionError("المفروض ترمي TypeError — استخدم * في تعريف الدالة")
