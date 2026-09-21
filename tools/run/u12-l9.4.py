import json
def load_settings(path, defaults):
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        return dict(defaults)
    except json.JSONDecodeError as e:
        print(f"⚠️ الملف بايظ (سطر {e.lineno}، عمود {e.colno}) — هنستخدم الافتراضي")
        return dict(defaults)
    return defaults | data
DEFAULTS = {"theme": "light", "font_size": 12}
print(load_settings("missing.json", DEFAULTS))
with open("broken.json", "w", encoding="utf-8") as f:
    f.write('{"theme": "dark",}')
print(load_settings("broken.json", DEFAULTS))
with open("user.json", "w", encoding="utf-8") as f:
    f.write('{"font_size": 18}')
print(load_settings("user.json", DEFAULTS))
