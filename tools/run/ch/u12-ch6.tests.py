import json, os, tempfile
from datetime import date

def tmp(name="notes.json"):
    return os.path.join(tempfile.mkdtemp(), name)

SAMPLE = [{"title": "مذاكرة JSON", "day": date(2025, 3, 15)}, {"title": "رياضة", "day": date(2025, 3, 16)}]

def test_round_trip():
    "حفظ واسترجاع بنفس القيم (والتاريخ كائن date)"
    path = tmp()
    save_notes(path, SAMPLE)
    back = load_notes(path)
    assert back == SAMPLE, back

def test_readable_file():
    "الملف JSON صحيح، فيه العربي مقروء والتاريخ نص ISO"
    path = tmp()
    save_notes(path, SAMPLE)
    text = open(path, encoding="utf-8").read()
    assert "مذاكرة" in text, "استخدم ensure_ascii=False مع encoding='utf-8'"
    assert json.loads(text)[0]["day"] == "2025-03-15"

def test_missing_file():
    "ملف مش موجود ← []"
    assert load_notes(tmp("nothing.json")) == []

def test_broken_file():
    "ملف بايظ ← []"
    path = tmp()
    with open(path, "w", encoding="utf-8") as f:
        f.write("{not json")
    assert load_notes(path) == []
