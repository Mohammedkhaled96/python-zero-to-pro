PROGRAM_MODE = True

def total_for(n):
    out = run_program(f"{n}\n")
    return out.strip().splitlines()[-1].strip(), out

def test_10():
    "n = 10 ← 30"
    got, out = total_for(10)
    assert got == "مجموع الزوجي: 30", out

def test_includes_n():
    "n = 2 ← 2 (لازم n نفسها تدخل)"
    got, out = total_for(2)
    assert got == "مجموع الزوجي: 2", out

def test_one():
    "n = 1 ← 0 (مفيش زوجي)"
    got, out = total_for(1)
    assert got == "مجموع الزوجي: 0", out
