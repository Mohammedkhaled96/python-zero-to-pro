def test_top3():
    "top3 = [95, 88, 70]"
    assert top3 == [95, 88, 70], f"top3 = {top3!r}"

def test_original_untouched():
    "القائمة الأصلية ما اتغيّرتش"
    assert scores == [70, 95, 40, 88, 60], f"scores بقت {scores!r} — استخدم sorted بدل sort"

def test_spread():
    "spread = 55"
    assert spread == 55, f"spread = {spread!r}"

def test_average():
    "average = 70.6"
    assert average == 70.6, f"average = {average!r}"
