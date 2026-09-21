PROGRAM_MODE = True

def ending(stdin):
    out = run_program(stdin)
    assert "Traceback" not in out, "البرنامج وقع:\n" + out
    return out.strip().splitlines()[-1].strip()

def test_normal():
    "10 ÷ 3 ← الناتج: 3.33"
    assert ending("10\n3\n") == "الناتج: 3.33"

def test_float():
    "7.5 ÷ 2.5 ← الناتج: 3.0"
    assert ending("7.5\n2.5\n") == "الناتج: 3.0"

def test_zero():
    "القسمة على صفر ← رسالة مش crash"
    assert ending("5\n0\n") == "مينفعش القسمة على صفر"

def test_text():
    "حروف مكان رقم ← لازم تدخل أرقام"
    assert ending("abc\n2\n") == "لازم تدخل أرقام"
