import re
import csv
from collections import Counter
from pathlib import Path
SAMPLE = """\
2025-03-15 09:00:01 INFO [auth] User 7 logged in
2025-03-15 09:00:05 WARNING [payments] Slow response 2300ms
2025-03-15 09:01:10 ERROR [payments] Card declined for user 42
2025-03-15 09:02:44 ERROR [auth] Invalid token for user 13
this line is corrupted
2025-03-15 09:03:00 INFO [orders] Order 1001 created
2025-03-15 09:04:12 ERROR [payments] Card declined for user 7
2025-03-15 09:05:59 WARNING [orders] Slow response 1800ms
"""
LINE = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) "
    r"(?P<level>INFO|WARNING|ERROR) \[(?P<module>\w+)\] (?P<message>.+)"
)
SLOW = re.compile(r"Slow response (\d+)ms")
USER = re.compile(r"user (\d+)", re.IGNORECASE)
def parse(path):
    records, bad = [], 0
    with open(path, encoding="utf-8") as f:
        for line in f:
            m = LINE.fullmatch(line.strip())
            if m:
                records.append(m.groupdict())
            else:
                bad += 1
    return records, bad
def normalize(message):
    return re.sub(r"\d+", "N", message)
Path("app.log").write_text(SAMPLE, encoding="utf-8")
records, bad = parse("app.log")
print(f"سطور سليمة: {len(records)} — سطور بايظة: {bad}")
levels = Counter(r["level"] for r in records)
print(dict(levels))
errors = [r for r in records if r["level"] == "ERROR"]
print("الأخطاء لكل جزء:", dict(Counter(r["module"] for r in errors)))
for msg, n in Counter(normalize(r["message"]) for r in errors).most_common():
    print(f"  {n}× {msg}")
slow = [int(m.group(1)) for r in records if (m := SLOW.search(r["message"]))]
print("أبطأ استجابة:", max(slow), "ms")
users = sorted({int(u) for r in errors for u in USER.findall(r["message"])})
print("مستخدمين اتأثّروا:", users)
with open("errors.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "time", "module", "message"])
    writer.writeheader()
    for r in errors:
        writer.writerow({k: r[k] for k in writer.fieldnames})
print(Path("errors.csv").read_text(encoding="utf-8").splitlines()[:2])
