PROGRAM_MODE = True

def last(stdin):
    out = run_program(stdin)
    return out.strip().splitlines()[-1].strip(), out

def test_369():
    "3 و 6 و 9 ← المتوسط: 6.0"
    line, out = last("3\n6\n9\n")
    assert line == "المتوسط: 6.0", out

def test_124():
    "1 و 2 و 4 ← المتوسط: 2.33"
    line, out = last("1\n2\n4\n")
    assert line == "المتوسط: 2.33", out

def test_same():
    "10 و 10 و 10 ← المتوسط: 10.0"
    line, out = last("10\n10\n10\n")
    assert line == "المتوسط: 10.0", out
