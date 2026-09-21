def test_both():
    "1h30m ← 90"
    assert parse_duration("1h30m") == 90

def test_minutes_only():
    "45m ← 45"
    assert parse_duration("45m") == 45

def test_hours_only():
    "2h ← 120"
    assert parse_duration("2h") == 120

def test_messy():
    "' 1H 5M ' ← 65"
    assert parse_duration(" 1H 5M ") == 65

def test_rejects():
    "'' و 'abc' و '90' ← ValueError"
    for bad in ["", "abc", "90", "m"]:
        try:
            parse_duration(bad)
        except ValueError:
            continue
        raise AssertionError(f"parse_duration({bad!r}) ما رمتش ValueError")
