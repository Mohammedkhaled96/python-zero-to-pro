pairs = input("البيانات: ").split()
groups = {}
for pair in pairs:
    name, city = pair.split(":")
    groups.setdefault(city, []).append(name)
for city in sorted(groups):
    print(f"{city}: {', '.join(groups[city])}")
