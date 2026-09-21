PROGRAM_MODE = True

def steps_for(n):
    out = run_program(f"{n}\n")
    return out.strip().splitlines()[-1].strip(), out

def test_6():
    "6 ← 8 خطوات"
    got, out = steps_for(6)
    assert got == "عدد الخطوات: 8", out

def test_1():
    "1 ← 0 خطوات (وصلنا من الأول)"
    got, out = steps_for(1)
    assert got == "عدد الخطوات: 0", out

def test_27():
    "27 ← 111 خطوة"
    got, out = steps_for(27)
    assert got == "عدد الخطوات: 111", out
