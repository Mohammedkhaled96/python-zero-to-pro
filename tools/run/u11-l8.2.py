from functools import wraps
def log_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"→ {func.__name__}{args}")
        return func(*args, **kwargs)
    return wrapper
@log_calls
def greet(name, punctuation="!"):
    """ترحيب بسيط"""
    return f"أهلًا {name}{punctuation}"
print(greet("سارة"))
print(greet.__name__, "|", greet.__doc__)
