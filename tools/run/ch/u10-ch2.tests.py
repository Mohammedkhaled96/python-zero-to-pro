PROGRAM_MODE = True

def lines(stdin, n):
    out = run_program(stdin)
    return [l.strip() for l in out.strip().splitlines()][-n:], out

def test_example():
    "المثال: cairo ثم giza"
    got, out = lines("sara:cairo ali:giza mona:cairo\n", 2)
    assert got == ["cairo: sara, mona", "giza: ali"], out

def test_sorting():
    "المدن مرتّبة: x:b y:a ← a ثم b"
    got, out = lines("x:b y:a\n", 2)
    assert got == ["a: y", "b: x"], out
