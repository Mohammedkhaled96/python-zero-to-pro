import os
import requests
token = os.environ.get("API_TOKEN", "demo-token")
response = requests.post(
    "https://httpbin.org/post",
    json={"name": "sara", "score": 91},
    headers={"Authorization": f"Bearer {token}"},
    timeout=10,
)
response.raise_for_status()
echo = response.json()
print(echo["json"])
print(echo["headers"]["Authorization"])
