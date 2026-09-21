import re
text = "Order 66 costs 250 EGP, order 67 costs 1200 EGP"
print(re.findall(r"\d+", text))
print(len("\b"), len(r"\b"))
