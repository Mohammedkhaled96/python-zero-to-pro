record = ("سارة", 28, "القاهرة", "مهندسة", "sara@mail.com")
name, age, *_, email = record
print(name, age, email)
students = [("سارة", (90, 85)), ("أحمد", (70, 95))]
for student, (math_score, science) in students:
    print(student, math_score + science)
