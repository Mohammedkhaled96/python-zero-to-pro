import os
path = "settings.txt"
if os.path.exists(path):
    with open(path, encoding="utf-8") as f:
        print(f.read())
else:
    print("مفيش إعدادات — هنستخدم الافتراضي")
