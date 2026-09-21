def get_first(items):               # O(1) — عملية واحدة مهما كان الحجم
    return items[0]
def total(items):                   # O(n) — حلقة واحدة
    s = 0
    for x in items:
        s += x
    return s
def has_duplicate_slow(items):      # O(n²) — حلقة جوّه حلقة
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False
def has_duplicate_fast(items):      # O(n) — حلقة واحدة + set
    seen = set()
    for x in items:
        if x in seen:               # O(1) في الـ set
            return True
        seen.add(x)
    return False
import time
import random
data = random.sample(range(10_000_000), 5_000)      # 5 آلاف رقم مختلف
start = time.perf_counter()
has_duplicate_slow(data)
slow = time.perf_counter() - start
start = time.perf_counter()
has_duplicate_fast(data)
fast = time.perf_counter() - start
print(f"البطيء O(n²): {slow:.2f} ثانية")
print(f"السريع O(n) : {fast:.4f} ثانية")
print(f"أسرع بـ {slow / fast:,.0f} مرّة")
