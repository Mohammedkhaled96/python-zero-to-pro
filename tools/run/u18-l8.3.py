import hashlib
import secrets
ITERATIONS = 600_000
def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return salt.hex() + ":" + digest.hex()
def verify_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split(":")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), ITERATIONS)
    return secrets.compare_digest(digest.hex(), digest_hex)
stored = hash_password("Secret123")
print(len(stored))
print(verify_password("Secret123", stored))
print(verify_password("secret123", stored))
print(hash_password("Secret123") == stored)
