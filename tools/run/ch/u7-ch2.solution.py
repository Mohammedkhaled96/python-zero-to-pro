import math

students = int(input("عدد الطلاب: "))
capacity = int(input("سعة الأتوبيس: "))
buses = math.ceil(students / capacity)
print(f"محتاجين {buses} أتوبيس")
