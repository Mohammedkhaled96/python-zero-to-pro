password = "secretPass"
for ch in password:
    if ch.isdigit():
        print("تمام: فيها رقم")
        break
else:
    print("ضعيفة: مفيهاش ولا رقم")
print(any(ch.isdigit() for ch in password))
