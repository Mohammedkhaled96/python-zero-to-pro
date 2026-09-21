from datetime import datetime
moment = datetime(2025, 3, 15, 14, 30)
print(moment.strftime("%d/%m/%Y"))
print(moment.strftime("%Y-%m-%d %H:%M"))
print(moment.strftime("%I:%M %p"))
print(moment.strftime("%A %d %B %Y"))
print(f"{moment:%d-%m-%Y}")
