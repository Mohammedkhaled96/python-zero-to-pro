prices = {"قلم": 5, "كشكول": 25, "شنطة": 350}
with_vat = {item: round(p * 1.14, 2) for item, p in prices.items()}
print(with_vat)
cheap = {item: p for item, p in prices.items() if p < 100}
print(cheap)
flipped = {p: item for item, p in prices.items()}
print(flipped)
names = ["sara", "ahmed", "mona"]
lengths = {n: len(n) for n in names}
print(lengths)
