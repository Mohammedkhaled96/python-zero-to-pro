from datetime import date, timedelta
start = date(2025, 1, 30)
print(start + timedelta(days=30))
print(start - timedelta(weeks=2))
exam = date(2025, 6, 1)
left = exam - start
print(left)
print(left.days)
