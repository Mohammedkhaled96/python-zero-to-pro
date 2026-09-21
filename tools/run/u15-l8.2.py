class BankError(Exception):
    """الأب لكل أخطاء البنك"""
class InsufficientFundsError(BankError):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"الرصيد {balance} مش كفاية لسحب {amount}")
class AccountLockedError(BankError):
    pass
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.locked = False
    def withdraw(self, amount):
        if self.locked:
            raise AccountLockedError(f"حساب {self.owner} مقفول")
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount
        return self.balance
acc = Account("سارة", 500)
try:
    acc.withdraw(800)
except InsufficientFundsError as e:
    print(e)
    print("ناقص:", e.amount - e.balance)
acc.locked = True
try:
    acc.withdraw(10)
except BankError as e:
    print(type(e).__name__, "→", e)
