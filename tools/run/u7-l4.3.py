from decimal import Decimal, ROUND_HALF_UP
print(0.1 + 0.2)
print(Decimal("0.1") + Decimal("0.2"))
print(Decimal(0.1))
price = Decimal("19.99")
qty = 3
total = price * qty
print(total)
vat = total * Decimal("0.14")
print(vat)
print(vat.quantize(Decimal("0.01")))
print(Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
print(round(2.675, 2))
