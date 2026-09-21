import time
def fetch(name, seconds):
    time.sleep(seconds)
    return f"{name} جاهز"
start = time.perf_counter()
results = [fetch("طلب 1", 0.3), fetch("طلب 2", 0.3), fetch("طلب 3", 0.3)]
print(results)
print("الوقت:", round(time.perf_counter() - start, 1), "ثانية")
