def test_defaults():
    "طلب جديد: حالته NEW وقائمته فاضية ومستقلّة"
    a, b = Order("sara"), Order("ali")
    assert a.status is OrderStatus.NEW
    a.add(Item("قلم", 5))
    assert b.items == [], "كل طلب لازم قائمته مستقلّة (default_factory)"

def test_total():
    "total = مجموع السعر × الكمية"
    o = Order("mona")
    o.add(Item("قلم", 5, 3))
    o.add(Item("كشكول", 25))
    assert o.total == 40

def test_happy_path():
    "NEW ← pay ← PAID ← ship ← SHIPPED"
    o = Order("omar")
    o.add(Item("x", 10))
    o.pay()
    assert o.status is OrderStatus.PAID
    o.ship()
    assert o.status is OrderStatus.SHIPPED

def test_invalid_transitions():
    "ship قبل الدفع، والدفع مرّتين، والإضافة بعد الدفع ← ValueError"
    def raises(fn):
        try:
            fn()
        except ValueError:
            return True
        return False
    o = Order("x")
    assert raises(o.ship), "ship قبل pay لازم ترمي ValueError"
    o.pay()
    assert raises(o.pay), "pay مرّتين لازم ترمي ValueError"
    assert raises(lambda: o.add(Item("y", 1))), "add بعد الدفع لازم ترمي ValueError"

def test_equality():
    "dataclass بتقارن بالقيم"
    assert Order("z") == Order("z")
