PROGRAM_MODE = True

def last(stdin):
    out = run_program(stdin)
    return out.strip().splitlines()[-1].strip(), out

def test_simple():
    "mohamed ahmed ali ← M.A.A"
    line, out = last("mohamed ahmed ali\n")
    assert line == "M.A.A", out

def test_spaces():
    "مسافات زيادة: '  sara   mahmoud hassan ' ← S.M.H"
    line, out = last("  sara   mahmoud hassan \n")
    assert line == "S.M.H", out
