"""Sync requests inside an async handler — single function to keep examples focused."""


import requests


async def charge(token: str, amount: int) -> dict:
    resp = requests.post("http://pay.local/charge", json={"token": token, "amount": amount})
    return resp.json()
