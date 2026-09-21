import json

GOOD = json.dumps({"name": "Cairo", "main": {"temp": 31.4}, "weather": [{"description": "clear sky"}]})

def test_good():
    "رد كامل ← Cairo: 31°C — clear sky"
    assert summarize(GOOD) == "Cairo: 31°C — clear sky", summarize(GOOD)

def test_missing_key():
    "مفتاح main ناقص ← بيانات ناقصة"
    assert summarize(json.dumps({"name": "Giza", "weather": [{"description": "rain"}]})) == "بيانات ناقصة"

def test_empty_weather():
    "قائمة weather فاضية ← بيانات ناقصة"
    assert summarize(json.dumps({"name": "X", "main": {"temp": 20}, "weather": []})) == "بيانات ناقصة"

def test_not_json():
    "نص مش JSON ← رد غير صالح"
    assert summarize("<html>Error 500</html>") == "رد غير صالح"
