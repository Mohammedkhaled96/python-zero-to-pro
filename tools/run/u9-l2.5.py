texts = ["42", "3.5", "abc"]
for t in texts:
    try:
        n = int(t)
        print(t, "←", n * 2)
    except ValueError:
        print(t, "← مش رقم صحيح")
print("البرنامج كمّل للآخر")
