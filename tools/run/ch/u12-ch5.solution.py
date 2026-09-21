import re

DATE = re.compile(r"(?<!\d)(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/(\d{4})(?!\d)")

def to_iso(text):
    return DATE.sub(r"\3-\2-\1", text)
