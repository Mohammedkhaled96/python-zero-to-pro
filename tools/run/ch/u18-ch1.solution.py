import secrets
import string

SYMBOLS = "!@#$%&*"
ALPHABET = string.ascii_letters + string.digits + SYMBOLS

def generate_password(length=12):
    if length < 8:
        raise ValueError("الطول لازم 8 على الأقل")
    required = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(SYMBOLS),
    ]
    rest = [secrets.choice(ALPHABET) for _ in range(length - len(required))]
    chars = required + rest
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)
