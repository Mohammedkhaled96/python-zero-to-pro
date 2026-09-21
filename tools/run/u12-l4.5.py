import csv
products = [
    {"sku": "P1", "name": "قلم", "price": 5},
    {"sku": "P2", "name": "كشكول", "price": 25},
]
with open("products.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=["sku", "name", "price"])
    writer.writeheader()
    writer.writerows(products)
with open("products.csv", encoding="utf-8-sig") as f:
    print(f.read())
