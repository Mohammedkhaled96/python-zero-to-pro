stock = {"قلم": 0, "كشكول": 5, "مسطرة": 0}
try:
    for item in stock:
        if stock[item] == 0:
            del stock[item]
except RuntimeError as e:
    print("RuntimeError:", e)
stock = {"قلم": 0, "كشكول": 5, "مسطرة": 0}
for item in list(stock):
    if stock[item] == 0:
        del stock[item]
print(stock)
stock = {"قلم": 0, "كشكول": 5, "مسطرة": 0}
available = {k: v for k, v in stock.items() if v > 0}
print(available)
