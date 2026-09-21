import re

def extract_phones(text):
    return re.findall(r"01\d{9}", text)
