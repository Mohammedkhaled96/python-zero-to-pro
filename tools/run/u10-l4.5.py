tags = {"python", "sql"}
tags.add("git")
tags.add("python")
print(sorted(tags))
tags.remove("sql")
tags.discard("java")
print(sorted(tags))
try:
    tags.remove("java")
except KeyError as e:
    print("KeyError:", e)
removed = tags.pop()
print(len(tags))
tags.clear()
print(tags)
