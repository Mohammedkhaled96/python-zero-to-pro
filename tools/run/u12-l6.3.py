png_header = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
with open("fake.png", "wb") as f:
    f.write(png_header + b"rest of image data")
with open("fake.png", "rb") as f:
    first = f.read(8)
print(first)
print(first[1:4])
print(first[0], hex(first[0]))
print(first == png_header)
