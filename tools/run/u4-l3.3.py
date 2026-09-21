username = "admin"
password = "1234"
if username == "admin":
    if password == "1234":
        print("أهلًا يا مدير")
    else:
        print("كلمة السر غلط")
else:
    print("مستخدم مش معروف")
if username == "admin" and password == "1234":
    print("نفس النتيجة بشرط واحد")
