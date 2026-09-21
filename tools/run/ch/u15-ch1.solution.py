class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    @staticmethod
    def _check(amount):
        if amount <= 0:
            raise ValueError("المبلغ لازم يكون موجب")

    def deposit(self, amount):
        self._check(amount)
        self._balance += amount

    def withdraw(self, amount):
        self._check(amount)
        if amount > self._balance:
            raise ValueError("الرصيد مش كفاية")
        self._balance -= amount

    def __str__(self):
        return f"Account({self.owner}: {self._balance})"
