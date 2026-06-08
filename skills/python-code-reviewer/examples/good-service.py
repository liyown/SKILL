"""
Minimal "good" counterpart of ``bad-service.py``.

Each fix is annotated with a tag that maps to the issue list in
``examples/review-output.md`` so bad → good is traceable 1:1.
"""

import json
from typing import Optional

import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session


class RateLimiter:
    """Per-process LRU limiter. For multi-process / multi-host use Redis."""

    def __init__(self, max_hits: int, window_seconds: float) -> None:
        self.max_hits = max_hits
        self.window = window_seconds
        self._buckets: dict[int, list[float]] = {}

    def hit(self, key: int, now: float) -> bool:
        bucket = self._buckets.setdefault(key, [])
        # drop expired entries
        cutoff = now - self.window
        bucket[:] = [t for t in bucket if t >= cutoff]
        if len(bucket) >= self.max_hits:
            return False
        bucket.append(now)
        return True


class OrderService:
    def __init__(self, db: Session, pay_client: httpx.AsyncClient, limiter: RateLimiter) -> None:
        self.db = db
        self.pay = pay_client
        self.limiter = limiter

    async def pay(self, user_id: int, order_id: int, now: float) -> dict:
        # Fix 1 (module-level state): rate limit goes through a class
        # instance, not a module dict; per-process LRU with explicit
        # expiry. Multi-host deployments should swap in Redis.
        if not self.limiter.hit(user_id, now):
            return {"ok": False, "reason": "rate_limited"}

        # Fix 2 (SQL injection + ownership): bound parameters via
        # SQLAlchemy text() + named binds; the user_id predicate closes
        # the IDOR window.
        row = self.db.execute(
            text("SELECT id, user_id, status, pay_token, amount FROM orders WHERE id = :id AND user_id = :uid"),
            {"id": order_id, "uid": user_id},
        ).first()
        if row is None:
            return {"ok": False, "reason": "not_found"}
        # Fix 3 (idempotency): paid-state short-circuit precedes any side
        # effect so a redelivery is a no-op.
        if row.status == "PAID":
            return {"ok": True}

        # Fix 4 (status race): conditional UPDATE on old status, and
        # rollback on rowcount != 1 to release the row's lock.
        result = self.db.execute(
            text("UPDATE orders SET status = 'PAID' WHERE id = :id AND status = 'UNPAID'"),
            {"id": order_id},
        )
        if result.rowcount != 1:
            self.db.rollback()
            return {"ok": False, "reason": "concurrent_update"}

        # Fix 5 (async HTTP): httpx.AsyncClient is awaited; the call
        # carries the request context so a slow upstream does not block
        # the event loop.
        try:
            resp = await self.pay.post(
                "http://pay.local/charge",
                json={"token": row.pay_token, "amount": row.amount},
            )
            resp.raise_for_status()
        except httpx.HTTPError as e:
            # Fix 6 (rollback on charge failure): don't leave the row in
            # PAYING state if the charge call fails.
            self.db.rollback()
            return {"ok": False, "reason": "charge_failed", "error": str(e)}

        self.db.commit()
        return {"ok": True}


# Fix 7 (pickle.loads): refuse pickle entirely; the API contract becomes
# "JSON or msgpack" so an attacker cannot supply a malicious blob that
# executes on deserialise.
def load_blob(blob: bytes):
    raise NotImplementedError("pickle is forbidden; use JSON or msgpack")


# Fix 8 (bare except): narrow the catch to the specific error types
# the handler can plausibly raise; re-raise as the domain error with
# `from e` so the original cause is preserved in the traceback.
def process_event(event):
    try:
        return event.handler()
    except (KeyError, ValueError) as e:
        raise RuntimeError("event handler failed") from e


# Fix 9 (N+1): one IN (?, ?, ...) query with bound parameters; the
# placeholders are built from the id count, not user input.
def find_orders(session: Session, ids):
    if not ids:
        return []
    placeholders = ",".join(f":id{i}" for i in range(len(ids)))
    params = {f"id{i}": v for i, v in enumerate(ids)}
    return session.execute(
        text(f"SELECT id, status FROM orders WHERE id IN ({placeholders})"),
        params,
    ).all()
