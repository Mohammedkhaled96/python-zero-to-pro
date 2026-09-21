class Connection:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"فتح {self.name}")
        return self
    def __exit__(self, exc_type, exc, tb):
        status = exc_type.__name__ if exc_type else "مفيش"
        print(f"قفل {self.name} (خطأ: {status})")
        return False
try:
    with Connection("db") as conn:
        print("شغل على", conn.name)
        raise ValueError("مشكلة")
except ValueError:
    print("اتمسك برّه")
