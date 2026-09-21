import inspect

def test_basic():
    "[1..5] بحجم 2 ← [1,2] [3,4] [5]"
    assert list(chunks([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]]

def test_empty():
    "قائمة فاضية ← ولا دفعة"
    assert list(chunks([], 3)) == []

def test_big_size():
    "حجم أكبر من القائمة ← دفعة واحدة"
    assert list(chunks([1, 2], 10)) == [[1, 2]]

def test_is_generator():
    "الدالة مولّد (فيها yield)"
    assert inspect.isgeneratorfunction(chunks), "استخدم yield"

def test_bad_size():
    "حجم 0 ← ValueError"
    try:
        list(chunks([1], 0))
    except ValueError:
        return
    raise AssertionError("المفروض ValueError")
