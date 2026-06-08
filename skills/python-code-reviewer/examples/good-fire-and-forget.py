"""
Good counterpart of fire-and-forget.py.
"""

import asyncio
import logging
from typing import Optional


log = logging.getLogger(__name__)


async def fetch_user(uid: int) -> Optional[dict]:
    await asyncio.sleep(0.01)
    return {"id": uid, "name": "u"}


async def fan_out(uid: int) -> list[dict]:
    # Fix 1 (held reference): keep a strong reference to the task. A
    # bare `asyncio.create_task(coro())` discards the reference and
    # lets the task be garbage-collected before it finishes, losing
    # the result and the exception.
    task = asyncio.create_task(fetch_user(uid))
    # Fix 2 (done callback): register a callback so a failure in the
    # background task is logged with full traceback, not silently
    # turned into an unhandled exception on loop teardown.
    task.add_done_callback(_log_task_exception)
    # Fix 3 (await): wait for the task to finish so the function's
    # result reflects its outcome.
    await task
    return [task.result()] if not task.cancelled() and task.exception() is None else []


def _log_task_exception(task: asyncio.Task) -> None:
    if task.cancelled():
        return
    exc = task.exception()
    if exc is not None:
        log.exception("background fetch_user failed", exc_info=exc)


async def main() -> None:
    await fan_out(1)


if __name__ == "__main__":
    asyncio.run(main())
