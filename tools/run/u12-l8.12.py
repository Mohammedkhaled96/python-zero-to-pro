import re
TIME = re.compile(r"\b(\d{1,2}):(\d{2})\s*(AM|PM)\b", re.I)
def to_24h(m):
    hour, minute, period = int(m.group(1)), m.group(2), m.group(3).upper()
    if period == "PM" and hour != 12:
        hour += 12
    if period == "AM" and hour == 12:
        hour = 0
    return f"{hour:02d}:{minute}"
print(TIME.sub(to_24h, "الاجتماع 9:05 PM والفطار 7:30am والسحور 12:15 AM"))
