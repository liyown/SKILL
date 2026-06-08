# Python Async Reviewer Prompt

> See also: prompts/web-reviewer.md, error-reviewer.md, sql-reviewer.md


For asyncio, async/await, tasks, the event loop, shared state, and async resource lifecycle.

## Required Checks

- Blocking IO (`requests`, `time.sleep`, `open().read()`, `psycopg2`, `pymysql`, `boto3` sync client) on the event loop stalls every other request on the worker.
- Shared mutable object (list / dict / set) across tasks without a lock; `asyncio` is single-threaded but `await` is a switch point, so state can interleave across `await`.
- Cross-request `aiohttp.ClientSession` / `httpx.AsyncClient` / `redis.asyncio.Redis` — must be created at app startup and reused; per-request creation exhausts file descriptors.
- Task started without collecting: `asyncio.create_task(coro())` without holding the reference or `await` — fire-and-forget exceptions are lost.
- `asyncio.gather` without `return_exceptions=True` cancels siblings on first failure, with unclear error types; with `True` you must check each.
- `asyncio.TaskGroup` (3.11+) replaces bare `gather` — using `tg.create_task` outside `async with` is an immediate error.
- `asyncio.wait_for` timeout too short cancels normal slow requests; resources after cancellation (HTTP response body, cursor) leak.
- `asyncio.CancelledError` is a `BaseException` subclass in 3.8+; catching and not re-raising breaks cancellation semantics.
- CPU-bound code under the GIL (regex, json.dumps of large objects, dense compute outside numpy) not routed through `ProcessPoolExecutor` / `run_in_executor`.
- `contextvars` not explicitly `copy_context().run(...)` across tasks; trace_id / user / tenant context is lost.

## Output Requirements

Explain when a task starts, when it cancels, and how blocking or cancellation impacts other requests on the event loop. Provide concrete code or framework doc references.

## Positive Example

```markdown
# Critical

## 1. Sync `requests` inside an async handler blocks the event loop

Location:
`order.handler.create_order`

Problem:
```python
async def create_order(req):
    ...
    r = requests.post(pay_url, json=body, timeout=5)
    return r.json()
```
`requests` is a sync library and blocks the current event loop worker.

Impact:
Other requests on the same worker have their latency inflated, p99 climbs, and the process appears to hang.

Suggestion:
Use `httpx.AsyncClient` and `await client.post(...)`, or wrap with `await loop.run_in_executor(None, ...)`.
```
