PROGRAM_MODE = True

def last_two(stdin):
    out = run_program(stdin)
    lines = [l.strip() for l in out.strip().splitlines() if l.strip()]
    return lines[-2:], out

def test_sentence():
    "python is fun and powerful ← 2 و powerful"
    got, out = last_two("python is fun and powerful\n")
    assert got == ["عدد الكلمات الطويلة: 2", "أطول كلمة: powerful"], out

def test_small_words():
    "a bb ccc dddd ← 1 و dddd"
    got, out = last_two("a bb ccc dddd\n")
    assert got == ["عدد الكلمات الطويلة: 1", "أطول كلمة: dddd"], out

def test_tie():
    "تعادل: abcd efgh ← أطول كلمة هي الأولى abcd"
    got, out = last_two("abcd efgh\n")
    assert got == ["عدد الكلمات الطويلة: 2", "أطول كلمة: abcd"], out
