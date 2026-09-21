def test_good():
    "(a[b]{c}) و '' ← True"
    assert is_balanced("(a[b]{c})") is True
    assert is_balanced("") is True

def test_wrong_type():
    "(] ← False"
    assert is_balanced("(]") is False

def test_order():
    ")( ← False (العدد متساوي بس الترتيب غلط)"
    assert is_balanced(")(") is False

def test_unclosed():
    "(( و [{ ← False"
    assert is_balanced("((") is False
    assert is_balanced("[{") is False

def test_crossed():
    "([)] ← False (متقاطعين)"
    assert is_balanced("([)]") is False
