from datetime import date
today = date(2025, 3, 15)
birthday = date(today.year, 8, 20)
if birthday < today:
    birthday = birthday.replace(year=today.year + 1)
print((birthday - today).days)
