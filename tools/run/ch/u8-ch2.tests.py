PROGRAM_MODE = True

def ending(stdin):
    out = run_program(stdin)
    return out.strip().splitlines()[-1].strip(), out

def test_three_wrong():
    "3 تخمينات غلط ← خلصت المحاولات"
    got, out = ending("1\n2\n3\n")
    assert got == "خلصت المحاولات", out

def test_no_fourth_chance():
    "التخمين الرابع ما يتقبلش حتى لو صح"
    got, out = ending("1\n2\n3\n7\n")
    assert got == "خلصت المحاولات", out

def test_second_try():
    "صح في التاني ← صح!"
    got, out = ending("5\n7\n")
    assert got == "صح!", out
