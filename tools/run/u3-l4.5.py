print(ord("A"), chr(66))
letter = "x"
position = ord(letter) - ord("a")
shifted = (position + 3) % 26
print(chr(ord("a") + shifted))
