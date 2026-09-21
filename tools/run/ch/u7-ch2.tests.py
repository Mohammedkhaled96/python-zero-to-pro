PROGRAM_MODE = True

def buses(s, c):
    out = run_program(f"{s}\n{c}\n")
    return out.strip().splitlines()[-1].strip(), out

def test_remainder():
    "47 طالب و 12 مقعد ← 4 أتوبيس"
    got, out = buses(47, 12)
    assert got == "محتاجين 4 أتوبيس", out

def test_exact():
    "48 و 12 ← 4 بالظبط"
    got, out = buses(48, 12)
    assert got == "محتاجين 4 أتوبيس", out

def test_small():
    "طالب واحد ← أتوبيس واحد"
    got, out = buses(1, 50)
    assert got == "محتاجين 1 أتوبيس", out
