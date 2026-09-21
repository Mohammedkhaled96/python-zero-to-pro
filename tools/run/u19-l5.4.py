from collections import defaultdict
rows = [
    {"branch": "المعادي", "day": "السبت", "sales": 4200},
    {"branch": "المعادي", "day": "الأحد", "sales": 3800},
    {"branch": "الزمالك", "day": "السبت", "sales": 5200},
    {"branch": "الزمالك", "day": "الأحد", "sales": 6100},
    {"branch": "طنطا", "day": "السبت", "sales": 2500},
]
groups = defaultdict(list)
for row in rows:
    groups[row["branch"]].append(row["sales"])
summary = [(b, sum(v), round(sum(v) / len(v))) for b, v in groups.items()]
for branch, total, avg in sorted(summary, key=lambda r: r[1], reverse=True):
    print(f"{branch:<8} إجمالي {total:>6,} · متوسّط {avg:>5,}")
print("إجمالي الكل:", f"{sum(r['sales'] for r in rows):,}")
