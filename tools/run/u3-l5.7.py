table = str.maketrans("aeiou", "12345")
print("education".translate(table))
digits = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
phone = "٠١٠١٢٣٤٥٦٧٨"
print(phone.translate(digits))
clean = str.maketrans("", "", "!?.,")
print("Hello, World!! How?".translate(clean))
