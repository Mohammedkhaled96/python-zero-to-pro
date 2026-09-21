PROGRAM_MODE = True

def top(stdin):
    out = run_program(stdin)
    return out.strip().splitlines()[-1].strip(), out

def test_basic():
    "the cat and the hat ← the (2)"
    got, out = top("the cat and the hat\n")
    assert got == "الأكثر تكرارًا: the (2)", out

def test_case():
    "Python python PYTHON is fun ← python (3)"
    got, out = top("Python python PYTHON is fun\n")
    assert got == "الأكثر تكرارًا: python (3)", out

def test_tie():
    "تعادل: b a ← b (1) لأنها الأولى"
    got, out = top("b a\n")
    assert got == "الأكثر تكرارًا: b (1)", out
