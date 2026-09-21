raw = "٠١٠-١٢٣ ٤٥٦٧٨"
table = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789", " -")
phone = raw.translate(table)
print(phone, len(phone) == 11)
