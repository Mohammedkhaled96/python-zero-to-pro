class Counting(list):
    def __init__(self, data):
        super().__init__(data)
        self.reads = 0

    def __getitem__(self, i):
        self.reads += 1
        return super().__getitem__(i)

def test_found():
    "بيلاقي 35 في [0, 5, 10, …]"
    assert binary_search(list(range(0, 100, 5)), 35) == 7

def test_missing():
    "العناصر المش موجودة ← -1"
    items = list(range(0, 100, 5))
    for t in (36, -5, 1000):
        assert binary_search(items, t) == -1, f"البحث عن {t}"

def test_edges():
    "أول عنصر وآخر عنصر وقائمة فاضية"
    items = [2, 4, 6, 8]
    assert binary_search(items, 2) == 0
    assert binary_search(items, 8) == 3
    assert binary_search([], 3) == -1

def test_efficient():
    "مليون عنصر ← 25 قراءة بحدّ أقصى"
    items = Counting(range(1_000_000))
    assert binary_search(items, 765_432) == 765_432
    assert 0 < items.reads <= 25, f"قريت {items.reads} عنصر — اقرا بالفهرس items[mid] وقسّم النطاق نصّين كل مرّة"
