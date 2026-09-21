import importlib
open("mathtools.py", "w", encoding="utf-8").write('"""أدوات حسابية بسيطة"""\n\nPI = 3.14159\n\ndef area_circle(r):\n    return PI * r ** 2\n\ndef is_even(n):\n    return n % 2 == 0\n')
importlib.invalidate_caches()
