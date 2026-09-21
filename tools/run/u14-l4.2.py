import asyncio
async def fetch(name, seconds):
    await asyncio.sleep(seconds)
    return f"{name} جاهز"
async def main():
    result = await fetch("طلب 1", 0.1)
    print(result)
    coro = fetch("طلب 2", 0.1)
    print(type(coro).__name__)
    print(await coro)
asyncio.run(main())
