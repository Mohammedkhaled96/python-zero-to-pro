a = "Straße"
b = "STRASSE"
print(a.lower() == b.lower())
print(a.casefold() == b.casefold())
name = "photo.JPG"
print(name.casefold().endswith((".jpg", ".png", ".gif")))
