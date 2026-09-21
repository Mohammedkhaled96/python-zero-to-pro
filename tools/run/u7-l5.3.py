from datetime import datetime
text = "25/12/2024 09:15"
parsed = datetime.strptime(text, "%d/%m/%Y %H:%M")
print(parsed)
print(type(parsed))
iso = datetime.fromisoformat("2024-12-25T09:15:00")
print(iso == parsed)
