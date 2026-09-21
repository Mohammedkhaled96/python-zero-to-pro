data = "سارة".encode("utf-8")
try:
    print(data.decode("ascii"))
except UnicodeDecodeError as e:
    print("خطأ:", e)
print(data.decode("cp1256"))
print(data.decode("ascii", errors="replace"))
print("café".encode("ascii", errors="ignore"))
