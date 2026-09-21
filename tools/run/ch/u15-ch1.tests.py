def test_deposit_withdraw():
    "إيداع 100 وسحب 30 من 50 ← 120"
    acc = BankAccount("sara", 50)
    acc.deposit(100)
    acc.withdraw(30)
    assert acc.balance == 120

def test_invalid_amounts():
    "مبلغ صفر أو سالب ← ValueError"
    acc = BankAccount("ali")
    for action in (acc.deposit, acc.withdraw):
        for bad in (0, -5):
            try:
                action(bad)
            except ValueError:
                continue
            raise AssertionError(f"{action.__name__}({bad}) ما رمتش ValueError")

def test_overdraw():
    "سحب أكبر من الرصيد ← ValueError والرصيد ما يتغيّرش"
    acc = BankAccount("mona", 40)
    try:
        acc.withdraw(100)
    except ValueError:
        pass
    else:
        raise AssertionError("السحب الزيادة ما رماش ValueError")
    assert acc.balance == 40

def test_read_only():
    "balance للقراءة بس"
    acc = BankAccount("omar", 10)
    try:
        acc.balance = 1_000_000
    except AttributeError:
        return
    raise AssertionError("قدرنا نغيّر balance مباشرةً — استخدم @property")

def test_str():
    "str ← Account(sara: 150)"
    assert str(BankAccount("sara", 150)) == "Account(sara: 150)"
