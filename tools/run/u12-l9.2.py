import json
data = {"point": (3, 4), 1: "one", "ok": True}
text = json.dumps(data)
print(text)
back = json.loads(text)
print(back)
print(back == data)
try:
    json.dumps({"tags": {"a", "b"}})
except TypeError as e:
    print("خطأ:", e)
