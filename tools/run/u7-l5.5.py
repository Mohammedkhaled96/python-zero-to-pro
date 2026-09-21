from datetime import datetime, timedelta
login = datetime(2025, 3, 15, 8, 45)
logout = datetime(2025, 3, 15, 17, 20)
worked = logout - login
print(worked)
hours = worked.total_seconds() / 3600
print(f"{hours:.2f} ساعة")
print(worked > timedelta(hours=8))
