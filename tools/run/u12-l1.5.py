with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("السطر الأول\n")
with open("notes.txt", "a", encoding="utf-8") as f:
    f.write("السطر التاني\n")
with open("notes.txt", "r", encoding="utf-8") as f:
    print(f.read(), end="")
print(f.closed)
try:
    open("notes.txt", "x")
except FileExistsError:
    print("الملف موجود — x رفضت تمسحه")
