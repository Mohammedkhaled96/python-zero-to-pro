text = "Hi سارة 😀"
data = text.encode("utf-8")
print(data)
print(type(data))
print(len(text), len(data))
print(data.decode("utf-8"))
print(list("A".encode()), list("س".encode()))
