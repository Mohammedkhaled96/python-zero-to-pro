class Cash:
    def pay(self, amount):
        return f"كاش: {amount}"
class Card:
    def pay(self, amount):
        return f"فيزا: {amount} + رسوم {amount * 0.02}"
class Wallet:
    def pay(self, amount):
        return f"محفظة: {amount}"
def checkout(method, amount):
    print(method.pay(amount))
for m in [Cash(), Card(), Wallet()]:
    checkout(m, 500)
