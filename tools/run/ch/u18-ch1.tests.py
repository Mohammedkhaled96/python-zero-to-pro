import string

ALLOWED = set(string.ascii_letters + string.digits + "!@#$%&*")

def test_lengths():
    "الطول الافتراضي 12، ولو طلبت 20 تبقى 20"
    assert len(generate_password()) == 12
    assert len(generate_password(20)) == 20

def test_rules_many_times():
    "200 كلمة سر: كلها فيها الأربع أنواع ومفيش حروف غريبة"
    for _ in range(200):
        pw = generate_password(8)
        assert set(pw) <= ALLOWED, f"حروف مش مسموحة في {pw!r}"
        assert any(c.islower() for c in pw), f"مفيش حرف صغير: {pw!r}"
        assert any(c.isupper() for c in pw), f"مفيش حرف كبير: {pw!r}"
        assert any(c.isdigit() for c in pw), f"مفيش رقم: {pw!r}"
        assert any(c in "!@#$%&*" for c in pw), f"مفيش رمز: {pw!r}"

def test_random_enough():
    "50 كلمة سر مختلفة"
    assert len({generate_password() for _ in range(50)}) == 50

def test_too_short():
    "طول 7 ← ValueError"
    try:
        generate_password(7)
    except ValueError:
        return
    raise AssertionError("المفروض ValueError")

def test_no_random_module():
    "مفيش استخدام لمكتبة random"
    code = USER_CODE
    assert "import random" not in code and "from random" not in code, "random مش آمنة للأسرار — استخدم secrets"
