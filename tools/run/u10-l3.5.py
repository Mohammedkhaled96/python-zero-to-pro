sales = [
    {"seller": "سارة", "amount": 4200},
    {"seller": "علي", "amount": 3100},
    {"seller": "منى", "amount": 5600},
]
total = sum(row["amount"] for row in sales)
best = max(sales, key=lambda row: row["amount"])
print("الإجمالي:", total)
print("الأعلى:", best["seller"], best["amount"])
for row in sorted(sales, key=lambda r: r["amount"], reverse=True):
    print(f"{row['seller']:<6} {row['amount']:>6,}")
