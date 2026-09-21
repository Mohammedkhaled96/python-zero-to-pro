from datetime import date, timedelta
first = date(2025, 3, 1)
for i in range(4):
    session = first + timedelta(weeks=i)
    print(f"المحاضرة {i + 1}: {session:%A %d/%m}")
