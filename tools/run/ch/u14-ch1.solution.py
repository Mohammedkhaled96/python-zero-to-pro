import json

def summarize(json_text):
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError:
        return "رد غير صالح"
    try:
        city = data["name"]
        temp = round(data["main"]["temp"])
        description = data["weather"][0]["description"]
    except (KeyError, IndexError, TypeError):
        return "بيانات ناقصة"
    return f"{city}: {temp}°C — {description}"
