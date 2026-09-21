from datetime import date, datetime
today = date(2025, 3, 15)
print(today)
print(today.year, today.month, today.day)
print(today.weekday(), today.isoweekday())
moment = datetime(2025, 3, 15, 14, 30, 5)
print(moment)
print(moment.hour, moment.minute)
print(moment.date())
