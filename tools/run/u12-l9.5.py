import json
from datetime import date
def to_json(obj):
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"مش عارف أحوّل {type(obj).__name__}")
order = {"id": 17, "day": date(2025, 3, 15), "tags": {"urgent", "gift"}}
text = json.dumps(order, default=to_json)
print(text)
def from_json(d):
    if "day" in d:
        d["day"] = date.fromisoformat(d["day"])
    return d
back = json.loads(text, object_hook=from_json)
print(back["day"].year, type(back["day"]).__name__)
