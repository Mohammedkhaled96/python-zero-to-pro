raw = "  ahmed   ALI hassan "
parts = raw.split()
print(" ".join(parts).title())
print(len(parts))
print("-".join(parts).lower())
print(raw.strip().startswith("ahmed"))
