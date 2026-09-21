def is_strong(password):
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isupper() for c in password)


def test_valid():
    assert is_strong("Secret123")

def test_too_short():
    assert not is_strong("Sec12")

def test_no_digit():
    assert not is_strong("SecretWord")

def test_no_upper():
    assert not is_strong("secret123")

def test_exactly_eight():
    assert is_strong("Secret12")
