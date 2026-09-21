def parse_age(text):
    try:
        return int(text)
    except ValueError:
        print(f"[log] مدخل غلط: {text!r}")
        raise
try:
    parse_age("abc")
except ValueError as e:
    print("الطبقة الأعلى:", e)
