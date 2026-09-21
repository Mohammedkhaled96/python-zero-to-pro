PROGRAM_MODE = True

def expected(n):
    res = []
    for i in range(1, n + 1):
        res.append("FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i))
    return res

def lines_for(n):
    out = run_program(f"{n}\n")
    lines = [l.strip() for l in out.strip().splitlines()]
    return lines[-n:], out

def test_15():
    "n = 15: السطور كلها صح"
    got, out = lines_for(15)
    assert got == expected(15), out

def test_1():
    "n = 1: سطر واحد فيه 1"
    got, out = lines_for(1)
    assert got == ["1"], out

def test_count():
    "n = 20: بالظبط 20 سطر نتيجة"
    out = run_program("20\n")
    assert out.strip().splitlines()[-20:] == expected(20), out
