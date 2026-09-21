import hashlib
import secrets
import string
alphabet = string.ascii_letters + string.digits + "!@#$%"
password = "".join(secrets.choice(alphabet) for _ in range(16))
print(len(password), password != "".join(secrets.choice(alphabet) for _ in range(16)))
def hash_password(plain, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt, 200_000)
    return salt, digest
def verify(plain, salt, digest):
    _, test = hash_password(plain, salt)
    return secrets.compare_digest(test, digest)
salt, digest = hash_password("s3cret-pass")
print(len(digest))
print(verify("s3cret-pass", salt, digest))
print(verify("wrong-pass", salt, digest))
print(hashlib.sha256(b"password123").hexdigest()[:16])
