try:
    with open("settings.txt", encoding="utf-8") as f:
        print(f.read())
except FileNotFoundError:
    print("مفيش إعدادات — هنستخدم الافتراضي")
