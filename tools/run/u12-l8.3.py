import re
print(re.findall(r"colou?r", "color colour colr"))
print(re.findall(r"\b\w{5}\b", "one three seven eleven"))
print(re.findall(r"[A-Z][a-z]+", "Cairo and Giza, not alex"))
print(re.findall(r"\d{2,3}", "7 42 123 9999"))
print(re.findall(r"\bcat\b", "cat catalog bobcat cat."))
print(re.findall(r"[^\w\s]", "Hi! How's it going?"))
print(re.findall(r"(?<!\d)\d{3}(?!\d)", "12 345 6789"))
