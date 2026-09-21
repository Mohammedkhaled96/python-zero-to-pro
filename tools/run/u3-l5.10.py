path = "C:/Users/sara/Documents/cv.final.docx"
name = path.rpartition("/")[2]
stem, _, ext = name.rpartition(".")
print(name)
print(ext)
print(stem)
