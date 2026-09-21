import json
response = '''
{"city": "Cairo", "forecast": [
  {"day": "Sat", "temp": {"min": 18, "max": 29}},
  {"day": "Sun", "temp": {"min": 17, "max": 31}}
]}
'''
data = json.loads(response)
for day in data["forecast"]:
    print(day["day"], day["temp"]["max"])
hottest = max(data["forecast"], key=lambda d: d["temp"]["max"])
print("أحرّ يوم:", hottest["day"])
print(data.get("alerts", []))
