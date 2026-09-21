from datetime import date
birth = date(2000, 8, 20)
today = date(2025, 3, 15)
had_birthday = (today.month, today.day) >= (birth.month, birth.day)
age = today.year - birth.year - (not had_birthday)
print(age)
print(f"{(today - birth).days:,} يوم")
