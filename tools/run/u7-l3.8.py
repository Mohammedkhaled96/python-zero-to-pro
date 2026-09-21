import random
import string
chars = string.ascii_uppercase + string.digits
code = "".join(random.choices(chars, k=6))
print(len(code), all(c in chars for c in code))
print(string.punctuation[:5])
