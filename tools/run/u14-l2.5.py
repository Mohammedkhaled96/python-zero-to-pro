import requests
response = requests.get(
    "https://httpbin.org/get",
    params={"q": "بايثون", "page": 2},
    timeout=10,
)
print(response.status_code, response.ok)
print(response.url)
print(response.headers["Content-Type"])
print(response.json()["args"])
