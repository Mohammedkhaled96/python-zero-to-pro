import json
from datetime import date

def save_notes(path, notes):
    data = [{"title": n["title"], "day": n["day"].isoformat()} for n in notes]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_notes(path):
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    return [{"title": d["title"], "day": date.fromisoformat(d["day"])} for d in data]
