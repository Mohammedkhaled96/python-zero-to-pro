from decimal import Decimal, ROUND_HALF_UP
bill = Decimal("347.50")
total = bill * Decimal("1.12")
share = (total / 4).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
print(f"الإجمالي: {total} — نصيب كل واحد: {share}")
