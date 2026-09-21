def _user_tests():
    return [f for n, f in list(globals().items())
            if n.startswith("test_") and callable(f)
            and getattr(getattr(f, "__code__", None), "co_filename", "") == "main.py"]

def _passes_with(impl):
    for t in _user_tests():
        g = t.__globals__
        old = g.get("is_strong")
        g["is_strong"] = impl
        try:
            t()
        except Exception:
            return False
        finally:
            g["is_strong"] = old
    return True

def _real(p):
    return len(p) >= 8 and any(c.isdigit() for c in p) and any(c.isupper() for c in p)

def test_enough_tests():
    "كتبت 3 اختبارات أو أكتر"
    n = len(_user_tests())
    assert n >= 3, f"لقينا {n} اختبار بس"

def test_green_on_real():
    "اختباراتك بتنجح على الدالة الصحيحة"
    assert _passes_with(_real), "فيه اختبار عندك بيفشل على الدالة الصحيحة — راجع توقّعاته"

def test_catches_no_length():
    "بتكتشف دالة ناسية شرط الطول"
    assert not _passes_with(lambda p: any(c.isdigit() for c in p) and any(c.isupper() for c in p)), "جرّب كلمة قصيرة فيها رقم وحرف كبير"

def test_catches_no_digit():
    "بتكتشف دالة ناسية شرط الرقم"
    assert not _passes_with(lambda p: len(p) >= 8 and any(c.isupper() for c in p)), "جرّب كلمة طويلة من غير أرقام"

def test_catches_no_upper():
    "بتكتشف دالة ناسية شرط الحرف الكبير"
    assert not _passes_with(lambda p: len(p) >= 8 and any(c.isdigit() for c in p)), "جرّب كلمة طويلة بحروف صغيرة بس"

def test_catches_boundary():
    "بتكتشف لو >= بقت > (الحدّ: 8 حروف بالظبط)"
    assert not _passes_with(lambda p: len(p) > 8 and any(c.isdigit() for c in p) and any(c.isupper() for c in p)), "اختبر كلمة سليمة طولها 8 بالظبط"
