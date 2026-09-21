data = "مرحبا Python".encode("utf-8")
print(" ".join(f"{b:02x}" for b in data[:16]))
