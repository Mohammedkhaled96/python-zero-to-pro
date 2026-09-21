products = [
    {"name": "Mouse", "cat": "tech", "price": 250},
    {"name": "Pen", "cat": "office", "price": 10},
    {"name": "Laptop", "cat": "tech", "price": 30000},
    {"name": "Stapler", "cat": "office", "price": 60},
]
ordered = sorted(products, key=lambda p: (p["cat"], -p["price"]))
print([p["name"] for p in ordered])
