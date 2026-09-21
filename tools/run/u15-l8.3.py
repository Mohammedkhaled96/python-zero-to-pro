import json
class ConfigError(Exception):
    pass
def load_config(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ConfigError("ملف الإعدادات بايظ") from e
try:
    load_config("{port: 80}")
except ConfigError as e:
    print(e)
    print("السبب الأصلي:", type(e.__cause__).__name__)
