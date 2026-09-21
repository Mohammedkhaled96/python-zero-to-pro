import time
start = time.perf_counter()
for i in range(3, 0, -1):
    print(f"{i}…")
    time.sleep(0.2)
print("انطلق! 🚀")
elapsed = time.perf_counter() - start
print(f"المدّة: {elapsed:.1f} ثانية")
print(time.time() > 1_700_000_000)
