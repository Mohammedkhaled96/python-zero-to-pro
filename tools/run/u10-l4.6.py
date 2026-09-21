backend = {"python", "sql", "git", "docker"}
student = {"python", "git"}
print(student.issubset(backend), student <= backend)
print(backend.issuperset(student), backend >= student)
print(student < backend, backend < backend)
print({"java"}.isdisjoint(backend))
missing = backend - student
print(f"ناقصك: {sorted(missing)}")
a = {1, 2}
a |= {3}
a &= {2, 3, 4}
print(a)
