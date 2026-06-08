"""
Minimal "bad" Python backend service that demonstrates several production-risk
issues. Each numbered comment maps to an issue called out in
``examples/review-output.md``.
"""

import json
import pickle
import time
from typing import Optional

import requests
from sqlalchemy import text
from sqlalchemy.orm import Session


HITS = {}  # issue 1: module-level mutable state shared across requests


class OrderService:
    def __init__(self, db: Session, pay_client=requests):
        self.db = db
        self.pay_client = pay_client

    def pay(self, user_id: int, order_id: int) -> dict:
        # issue 1: rate limit writes to module-level dict without lock
        HITS.setdefault(user_id, []).append(time.time())

        # issue 2: f-string into raw SQL — classic injection
        row = self.db.execute(
            text(f"SELECT * FROM orders WHERE id = {order_id} AND user_id = {user_id}")
        ).first()
        if row is None:
            return {"ok": False, "reason": "not_found"}
        if row.status == "PAID":
            return {"ok": True}

        # issue 3: synchronously calls pay API inside what should be async path
        resp = self.pay_client.post(
            "http://pay.local/charge",
            json={"token": row.pay_token, "amount": row.amount},
        )
        resp.raise_for_status()

        # issue 4: status transition has no WHERE-clause guard — race window
        self.db.execute(
            text(f"UPDATE orders SET status = 'PAID' WHERE id = {order_id}")
        )
        self.db.commit()
        return {"ok": True}


def load_blob(blob: bytes) -> object:  # issue 5: pickle.loads on untrusted input
    return pickle.loads(blob)


def process_event(event):  # issue 6: bare except swallows everything
    try:
        return event.handler()
    except Exception:
        return None


def find_orders(session: Session, ids):  # issue 7: N+1 in a loop
    out = []
    for oid in ids:
        o = session.execute(text("SELECT id, status FROM orders WHERE id = :id"), {"id": oid}).first()
        if o:
            out.append(o)
    return out


# issue 8: async handler that blocks the event loop with sync requests
async def create_order_async(pay_url: str, body: dict):
    r = requests.post(pay_url, json=body, timeout=5)  # blocks event loop
    return r.json()
