defaults = {"theme": "dark", "lang": "ar", "font": 14}
user = {"lang": "en", "font": 18}
merged = {**defaults, **user}
print(merged)
merged2 = defaults | user
print(merged2 == merged)
print(user | defaults)
defaults |= {"font": 16}
print(defaults)
settings = {**defaults, "debug": True}
print(settings)
