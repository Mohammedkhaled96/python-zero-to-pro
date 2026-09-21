import asyncio
import time
async def download(name, seconds):
    await asyncio.sleep(seconds)
    return name
async def main():
    start = time.perf_counter()
    files = await asyncio.gather(download("a", 0.4), download("b", 0.3), download("c", 0.2))
    print(files, round(time.perf_counter() - start, 1))
asyncio.run(main())
