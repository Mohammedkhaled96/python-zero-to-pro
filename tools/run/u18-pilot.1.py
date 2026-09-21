import json
from pathlib import Path
from collections import Counter, defaultdict
from statistics import mean
files = sorted(Path("pilot").glob("*.json"))
students = [json.loads(f.read_text(encoding="utf-8")) for f in files]
print(f"عدد الطلاب: {len(students)}")
thumbs_down = Counter()
notes = defaultdict(list)
minutes = defaultdict(list)
solved = Counter()
tries = defaultdict(list)
for s in students:
    for lesson, fb in s["feedback"].items():
        if fb.get("v") == -1:
            thumbs_down[lesson] += 1
            if fb.get("note"):
                notes[lesson].append(fb["note"])
    for lesson, secs in s["timeSeconds"].items():
        minutes[lesson].append(secs / 60)
    for ch, info in s["challenges"].items():
        tries[ch].append(info["tries"])
        if info["solved"]:
            solved[ch] += 1
print("\nأكتر دروس اتقال عليها «مش واضح»:")
for lesson, n in thumbs_down.most_common(3):
    print(f"  {lesson}: {n} طالب — {' / '.join(notes[lesson][:2])}")
print("\nأصعب التحدّيات (نسبة الحل):")
for ch in sorted(tries, key=lambda c: solved[c] / len(tries[c]))[:3]:
    rate = solved[ch] / len(tries[ch])
    print(f"  {ch}: {rate:.0%} حلّوه — متوسّط المحاولات {mean(tries[ch]):.1f}")
print("\nأطول دروس في الوقت الفعلي (دقايق):")
for lesson in sorted(minutes, key=lambda l: -mean(minutes[l]))[:3]:
    print(f"  {lesson}: {mean(minutes[lesson]):.0f}")
