import re

PHONE = re.compile(r"(?<!\d)(?:\+20|0020|0)(1[0125]\d{8})(?!\d)")

def extract_phones(text):
    found = []
    for m in PHONE.finditer(text):
        number = "0" + m.group(1)
        if number not in found:
            found.append(number)
    return found
