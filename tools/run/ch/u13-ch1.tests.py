def test_mask_basic():
    "mask('python', {'p', 'o'}) ← 'p _ _ _ o _'"
    assert mask("python", {"p", "o"}) == "p _ _ _ o _", repr(mask("python", {"p", "o"}))

def test_mask_case():
    "mask('Python', {'p'}) ← 'P _ _ _ _ _' (الحرف بشكله الأصلي)"
    assert mask("Python", {"p"}) == "P _ _ _ _ _"

def test_mask_nothing():
    "من غير تخمينات ← كله شرط"
    assert mask("abc", set()) == "_ _ _"

def test_won():
    "is_won: كل الحروف ← True، ناقص حرف ← False"
    assert is_won("level", {"l", "e", "v"}) is True
    assert is_won("level", {"l", "e"}) is False
