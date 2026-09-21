from contextlib import contextmanager
@contextmanager
def section(title):
    print(f"┌── {title}")
    try:
        yield
    finally:
        print(f"└── نهاية {title}")
with section("تقرير"):
    print("│ السطر الأول")
    print("│ السطر التاني")
