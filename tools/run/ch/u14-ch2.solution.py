import re

EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")

def extract_emails(text):
    found = {match.lower() for match in EMAIL.findall(text)}
    return sorted(found)
