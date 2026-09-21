import secrets
import string
token = secrets.token_hex(16)
print(len(token))
link_token = secrets.token_urlsafe(32)
print(len(link_token) >= 43)
alphabet = string.ascii_letters + string.digits
password = "".join(secrets.choice(alphabet) for _ in range(12))
print(len(password), password.isalnum())
code = f"{secrets.randbelow(1_000_000):06d}"
print(len(code))
