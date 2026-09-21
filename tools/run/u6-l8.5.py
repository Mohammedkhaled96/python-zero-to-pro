names = ["  sara ", "AHMED", "mona  "]
clean = [name.strip().title() for name in names]
print(clean)
scores = [88, 45, 92]
passed = [name for name, s in zip(clean, scores) if s >= 50]
print(passed)
numbered = [f"{i}. {name}" for i, name in enumerate(clean, 1)]
print(numbered)
