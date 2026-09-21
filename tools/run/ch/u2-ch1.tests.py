PROGRAM_MODE = True

def result(stdin):
    out = run_program(stdin)
    lines = [l for l in out.strip().splitlines() if l.strip()]
    return (lines[-1].strip() if lines else ""), out

def test_135():
    "135 دقيقة ← 2 ساعة و 15 دقيقة"
    line, out = result("135\n")
    assert line.endswith("2 ساعة و 15 دقيقة"), out

def test_59():
    "59 دقيقة ← 0 ساعة و 59 دقيقة"
    line, out = result("59\n")
    assert line.endswith("0 ساعة و 59 دقيقة"), out

def test_120():
    "120 دقيقة ← 2 ساعة و 0 دقيقة"
    line, out = result("120\n")
    assert line.endswith("2 ساعة و 0 دقيقة"), out
