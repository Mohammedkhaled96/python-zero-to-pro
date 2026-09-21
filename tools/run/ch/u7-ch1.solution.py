from datetime import datetime

first = input("التاريخ الأول: ")
second = input("التاريخ التاني: ")
d1 = datetime.strptime(first, "%d/%m/%Y")
d2 = datetime.strptime(second, "%d/%m/%Y")
print(f"الفرق: {abs((d2 - d1).days)} يوم")
