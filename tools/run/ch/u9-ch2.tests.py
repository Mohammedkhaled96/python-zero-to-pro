PROGRAM_MODE = True

def last_two(stdin):
    out = run_program(stdin)
    return [l.strip() for l in out.strip().splitlines()][-2:], out

def test_mixed():
    "10 x 5 -3 abc ← المجموع 12 والمرفوض x, abc"
    got, out = last_two("10 x 5 -3 abc\n")
    assert got == ["المجموع: 12", "المرفوض: x, abc"], out

def test_clean():
    "1 2 3 ← المجموع 6 والمرفوض لا يوجد"
    got, out = last_two("1 2 3\n")
    assert got == ["المجموع: 6", "المرفوض: لا يوجد"], out

def test_all_bad():
    "a b ← المجموع 0"
    got, out = last_two("a b\n")
    assert got == ["المجموع: 0", "المرفوض: a, b"], out
