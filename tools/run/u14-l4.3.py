import asyncio
import time
async def fetch(name, seconds):
    await asyncio.sleep(seconds)
    return f"{name} ({seconds}s)"
async def main():
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch("طلب 1", 0.3),
        fetch("طلب 2", 0.2),
        fetch("طلب 3", 0.1),
    )
    print(results)
    print("الوقت:", round(time.perf_counter() - start, 1), "ثانية")
asyncio.run(main())
