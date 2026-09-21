import json
from urllib.parse import urlencode
params = {"city": "القاهرة", "units": "metric"}
print("https://api.example.com/weather?" + urlencode(params))
status = 200
body = '{"city": "Cairo", "temp": 31.5, "tags": ["sunny", "dry"]}'
if status == 200:
    data = json.loads(body)
    print(data["city"], data["temp"])
    print(data.get("humidity", "غير متاحة"))
    print(", ".join(data["tags"]))
else:
    print("فشل الطلب:", status)
