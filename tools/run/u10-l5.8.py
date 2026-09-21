grades = {"سارة": 91, "أحمد": 42, "منى": 77}
status = {n: "ناجح" if g >= 50 else "راسب" for n, g in grades.items()}
passed = {n: g for n, g in grades.items() if g >= 50}
print(status)
print(passed)
