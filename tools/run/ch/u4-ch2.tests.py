PROGRAM_MODE = True

def verdict(y):
    out = run_program(f"{y}\n")
    return out.strip().splitlines()[-1].strip()

def test_2024():
    "2024 ← كبيسة"
    assert verdict(2024) == "كبيسة"

def test_1900():
    "1900 ← مش كبيسة (بتقبل القسمة على 100)"
    got = verdict(1900)
    assert got == "مش كبيسة", f"اتطبع {got!r}"

def test_2000():
    "2000 ← كبيسة (بتقبل القسمة على 400)"
    assert verdict(2000) == "كبيسة"

def test_others():
    "2023 و 2100 ← مش كبيسة"
    assert verdict(2023) == "مش كبيسة"
    assert verdict(2100) == "مش كبيسة"
