import re
line = "2025-03-15 14:02:11 ERROR [payments] Card declined for user 42"
m = re.match(r"(\d{4})-(\d{2})-(\d{2})", line)
print(m.group(0), m.group(1), m.groups())
year, month, day = map(int, m.groups())
print(year + 1, month, day)
pattern = r"(?P<date>\S+) (?P<time>\S+) (?P<level>[A-Z]+) \[(?P<module>\w+)\] (?P<message>.*)"
m = re.match(pattern, line)
print(m["level"], m["module"])
print(m.groupdict()["message"])
phones = "call 01012345678 or +201112345678, not 0101234567"
print(re.findall(r"(\+20|0)1[0125]\d{8}", phones))
print(re.findall(r"(?:\+20|0)1[0125]\d{8}", phones))
