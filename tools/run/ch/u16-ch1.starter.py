def is_strong(password):
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isupper() for c in password)


def test_example():
    assert is_strong("Secret123")
