def read_price(row):
    return float(row["price"])
def total(rows):
    return sum(read_price(r) for r in rows)
rows = [{"price": "10.5"}, {"price": "غير محدّد"}]
print(total(rows))
