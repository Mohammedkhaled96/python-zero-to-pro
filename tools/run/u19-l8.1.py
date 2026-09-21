import hashlib
from pathlib import Path
def fingerprint(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
config = Path("config.txt")
config.write_text("port=8080\n", encoding="utf-8", newline="\n")
original = fingerprint(config)
config.write_text("port=4444\n", encoding="utf-8", newline="\n")
print("سليم ✅" if fingerprint(config) == original else "الملف اتعدّل ⚠️")
