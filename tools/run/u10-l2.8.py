groups = {}
for name, city in [("سارة", "القاهرة"), ("علي", "طنطا"), ("منى", "القاهرة")]:
    groups.setdefault(city, []).append(name)
print(groups)
settings = {"theme": "dark", "lang": "ar"}
print(settings.setdefault("theme", "light"))
last = settings.popitem()
print(last, settings)
d = {"b": 1, "a": 2}
d["c"] = 3
print(list(d))
