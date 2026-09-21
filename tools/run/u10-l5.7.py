roles = frozenset(["admin", "editor", "admin"])
print(len(roles), "admin" in roles)
try:
    roles.add("viewer")
except AttributeError as e:
    print("مقفولة:", e)
permissions = {roles: "لوحة التحكم"}
print(permissions[frozenset(["editor", "admin"])])
groups = {frozenset({"a", "b"}), frozenset({"b", "a"})}
print(len(groups))
