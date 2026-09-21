import time
from contextlib import contextmanager
from functools import wraps
def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"[{func.__name__}] خلصت")
        return result
    return wrapper
@timed
def total(n):
    return sum(range(n))
print(total(1000))
print(total.__name__)
def run(command):
    match command.split():
        case ["add", x, y]:
            return int(x) + int(y)
        case ["quit"] | ["exit"]:
            return "وداعًا"
        case _:
            return "أمر مش معروف"
print(run("add 2 3"), run("exit"), run("dance"))
names = ["سارة", "علي"]
if (count := len(names)) > 1:
    print(f"عندنا {count} أسماء")
@contextmanager
def section(title):
    print(f"── {title} ──")
    try:
        yield
    finally:
        print("── تم ──")
with section("التقرير"):
    print("سطر جوّه القسم")
