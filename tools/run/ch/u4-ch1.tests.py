PROGRAM_MODE = True

def grade_of(n):
    out = run_program(f"{n}\n")
    return out.strip().splitlines()[-1].strip(), out

CASES = [(95, "A"), (90, "A"), (89, "B"), (80, "B"), (75, "C"), (60, "D"), (59, "F"), (0, "F"), (100, "A")]

def test_grades():
    "كل الحدود صح: 95، 90، 89، 80، 75، 60، 59، 0، 100"
    for n, expected in CASES:
        got, out = grade_of(n)
        assert got == expected, f"الدرجة {n}: المتوقّع {expected} لكن اتطبع {got!r}"

def test_invalid_high():
    "101 ← درجة غير صالحة"
    got, out = grade_of(101)
    assert got == "درجة غير صالحة", out

def test_invalid_low():
    "-1 ← درجة غير صالحة"
    got, out = grade_of(-1)
    assert got == "درجة غير صالحة", out
