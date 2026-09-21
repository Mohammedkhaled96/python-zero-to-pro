def test_simple():
    "level ← True"
    assert is_palindrome("level") is True

def test_case():
    "Level ← True (الحروف الكبيرة مش فارقة)"
    assert is_palindrome("Level") is True

def test_spaces():
    "Never odd or even ← True (المسافات مش فارقة)"
    assert is_palindrome("Never odd or even") is True

def test_false():
    "python ← False"
    assert is_palindrome("python") is False

def test_returns_bool():
    "الدالة بترجّع True/False مش None"
    result = is_palindrome("ab")
    assert result is False, f"رجّعت {result!r} — استخدم return"
