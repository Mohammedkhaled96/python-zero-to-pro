def is_adult(age):
    return age > 18
cases = [(20, True), (10, False), (18, True)]
for age, expected in cases:
    got = is_adult(age)
    status = "✓" if got == expected else "✗"
    print(status, age, "متوقّع", expected, "طلع", got)
