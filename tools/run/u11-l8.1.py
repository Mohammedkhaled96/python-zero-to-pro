def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"→ استدعاء {func.__name__} بـ {args} {kwargs}")
        result = func(*args, **kwargs)
        print(f"← رجّعت {result}")
        return result
    return wrapper
def add(a, b):
    return a + b
add = log_calls(add)
print(add(2, 3))
