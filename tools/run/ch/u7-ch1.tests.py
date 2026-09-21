PROGRAM_MODE = True

def diff(a, b):
    out = run_program(f"{a}\n{b}\n")
    return out.strip().splitlines()[-1].strip(), out

def test_jan_mar():
    "01/01/2025 و 01/03/2025 ← 59 يوم"
    got, out = diff("01/01/2025", "01/03/2025")
    assert got == "الفرق: 59 يوم", out

def test_same_day():
    "نفس اليوم ← 0 يوم"
    got, out = diff("10/05/2024", "10/05/2024")
    assert got == "الفرق: 0 يوم", out

def test_reverse_leap():
    "ترتيب معكوس في سنة كبيسة: 01/03/2024 و 01/02/2024 ← 29 يوم"
    got, out = diff("01/03/2024", "01/02/2024")
    assert got == "الفرق: 29 يوم", out
