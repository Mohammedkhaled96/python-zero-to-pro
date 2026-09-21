PROGRAM_MODE = True

def last_two(stdin):
    out = run_program(stdin)
    lines = [l.strip() for l in out.strip().splitlines() if l.strip()]
    return lines[-2:], out

def test_messy():
    "مسافات وحروف كبيرة ← sara.ahmed و company.com"
    got, out = last_two("  Sara.Ahmed@Company.COM  \n")
    assert got == ["sara.ahmed", "company.com"], out

def test_short():
    "ALI@X.IO ← ali و x.io"
    got, out = last_two("ALI@X.IO\n")
    assert got == ["ali", "x.io"], out
