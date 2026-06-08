"""
Good counterpart of async-blocks-loop.py.
"""


import httpx


async def charge(token: str, amount: int) -> dict:
    # Fix 1 (async client): use httpx.AsyncClient instead of the sync
    # `requests` library. The bad version's `requests.post` blocked
    # the event loop until the OS call returned, freezing every
    # other request on the same worker.
    async with httpx.AsyncClient(timeout=5) as client:
        # Fix 2 (await): the post call is awaited so the coroutine
        # yields control back to the event loop while the request
        # is in flight.
        resp = await client.post(
            "http://pay.local/charge",
            json={"token": token, "amount": amount},
        )
        resp.raise_for_status()
        return resp.json()
