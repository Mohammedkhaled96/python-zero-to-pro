def test_total_exists():
    "فيه متغيّر اسمه total قيمته 15"
    assert "total" in globals(), "مفيش متغيّر اسمه total"
    assert total == 15, f"total = {total!r} والمفروض 15"

def test_uses_variables():
    "الحساب من المتغيّرات مش رقم مكتوب بإيدك"
    code = USER_CODE.replace(" ", "")
    assert "price*qty" in code or "qty*price" in code, "احسب total من price و qty"

def test_line():
    "الطباعة بالشكل المطلوب بالظبط"
    assert "قلم × 3 = 15 جنيه" in OUTPUT, f"اللي اتطبع: {OUTPUT.strip()!r}"
