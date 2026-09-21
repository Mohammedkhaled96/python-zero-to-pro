import json

def summarize(json_text):
    data = json.loads(json_text)
    return f"{data['name']}: {data['main']['temp']}°C — {data['weather'][0]['description']}"
