# Python Web Reviewer Prompt

> See also: prompts/async-reviewer.md, security-reviewer.md, error-reviewer.md


For FastAPI, aiohttp, Django, Flask, and Starlette request handling, middleware, timeouts, streaming, dependency injection, and lifecycle.

## Required Checks

- Module-level mutable state (any dict/list outside `app.state.db`) is mutated by a request.
- Middleware order: auth after recover, trace at the outermost, CORS placement wrong.
- `request.json()` / `request.form()` without a size limit lets a slow attacker send a large body and exhaust memory.
- FastAPI `BackgroundTasks` adds a sync function that blocks the event loop; should `run_in_threadpool`.
- A yield dependency for `Depends(get_db)` is missing its close path; the connection leaks.
- Streaming response (SSE, file download) without explicit `media_type`, without timeout, without handling client disconnect.
- WebSocket: not handling `WebSocketDisconnect`, no heartbeat, no upper bound on the connection pool.
- Django `MIDDLEWARE` does not roll back the transaction when `process_view` raises.
- aiohttp `web.Application` creates `ClientSession` at startup but never `await session.close()` on shutdown.
- Missing global exception handler that wraps `RequestValidationError` into a uniform error format; or leaks internal stack trace into the response body.
- Sync `def` vs async `async def` handlers mixed in FastAPI; sync handlers run in the threadpool, but calling async from sync will deadlock.

## Output Requirements

State which step in the request lifecycle fails, how timeout / cancellation propagates, and the event loop state. Give a concrete fix.

## Positive Example

```markdown
# High

## 1. Global dict mutated by request causes cross-request contamination

Location:
`app.main.rate_limit`

Problem:
```python
HITS = {}
@app.middleware("http")
async def rate_limit(request, call_next):
    key = request.client.host
    HITS.setdefault(key, []).append(time.time())
```
Module-level dict is shared across processes/workers and is inconsistent; in async, multiple requests can mutate it concurrently.

Impact:
Rate limit is ineffective; memory grows linearly with request count.

Suggestion:
Use Redis atomic counters with a sliding window; or per-process with periodic cleanup.
```
