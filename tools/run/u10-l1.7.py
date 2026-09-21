employee = {"name": "سارة", "role": "مهندسة", "salary": 12000}
employee["city"] = "القاهرة"
employee["salary"] = 14000
print(len(employee), employee["role"])
print(employee.get("phone", "مش مسجّل"))
print("salary" in employee, "phone" in employee)
del employee["city"]
print(list(employee.keys()))
