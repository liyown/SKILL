import asyncio
import json
from typing import Optional


async def fetch_user(uid: int) -> Optional[dict]:
    await asyncio.sleep(0.01)
    return {"id": uid, "name": "u"}


async def fan_out(uid: int) -> list[dict]:
    # spawns a task and never collects it; exceptions are lost
    asyncio.create_task(fetch_user(uid))  # fire-and-forget
    await asyncio.sleep(0)
    return []


async def main() -> None:
    await fan_out(1)


if __name__ == "__main__":
    asyncio.run(main())
