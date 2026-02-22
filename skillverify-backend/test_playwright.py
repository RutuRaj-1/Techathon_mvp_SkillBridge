import asyncio
from playwright.async_api import async_playwright

async def run_test():
    print("starting")
    try:
        async with async_playwright() as p:
            print("got p")
            b = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            )
            print("launched b")
            await b.close()
            print("success")
    except Exception as e:
        print("ERROR:", repr(e))

if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(run_test())
