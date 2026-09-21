import asyncio
async def work(name, seconds):
    await asyncio.sleep(seconds)
    print("خلص:", name)
    return name
async def main():
    task = asyncio.create_task(work("خلفية", 0.1))
    print("المهمة اتجدولت وإحنا لسه شغالين")
    await task
    try:
        await asyncio.wait_for(work("بطيء", 1.0), timeout=0.2)
    except asyncio.TimeoutError:
        print("اتأخّر فألغيناه")
    done, pending = await asyncio.wait(
        [asyncio.create_task(work("سريع", 0.1)), asyncio.create_task(work("متأخّر", 0.5))],
        return_when=asyncio.FIRST_COMPLETED,
    )
    print("خلصت:", len(done), "· فاضل:", len(pending))
    for t in pending:
        t.cancel()
asyncio.run(main())
