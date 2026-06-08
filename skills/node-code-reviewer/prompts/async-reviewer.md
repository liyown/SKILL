# Node Async Reviewer Prompt

> See also: prompts/http-reviewer.md, error-reviewer.md, sql-reviewer.md


For async/await, Promise chain, event loop, unhandled rejection, AbortController, worker threads.

## Required Checks

- Lost `await`: a function returns a Promise but the caller does not `await`; the exception becomes an unhandled rejection.
- Sync CPU-bound (`JSON.parse(big)`, `crypto.pbkdf2Sync`, large array `sort`) on the main thread blocks the event loop and inflates all request latency.
- Sync IO (`fs.readFileSync`, `child_process.execSync`, sync database drivers) in the request path is equivalent to blocking the event loop.
- `Promise.all([...])` short-circuits on first reject, but other tasks may already have side effects (e.g. charged but rollback failed); pair with transactions or compensation.
- `Promise.race` "first to settle" — if the rejected branch already produced a side effect, the rollback may be missing.
- `setTimeout` / `setInterval` keeps the event loop reference, so `process.exit` / tests cannot exit; `unref()` may be re-`ref`-ed.
- Missing `unhandledRejection` listener or `process.on('unhandledRejection', ...)` only `console.error`s — production should fail-fast or report.
- `AbortController` not passed into downstream `fetch` / stream, so external cancellation cannot propagate.
- `worker_threads` created without limit, without reuse, without `terminate`; the main process becomes a worker factory.
- `for await (const x of asyncIterable)` with a slow consumer does not `break` / `return`; the upstream producer keeps producing.
- `Promise.resolve().then(...)` microtask starvation: recursive `then` without I/O yields keeps I/O from being scheduled.

## Output Requirements

Explain when a task starts, when it cancels, and how blocking or cancellation impacts other requests on the event loop. Provide concrete code or framework doc references.

## Positive Example

```markdown
# Critical

## 1. Sync `fs.readFileSync` in the request path blocks the event loop

Location:
`report.handler.generate`

Problem:
```ts
const data = fs.readFileSync(`/var/data/${id}.json`);
return JSON.parse(data);
```
Sync IO on the main thread blocks the event loop.

Impact:
Other requests on the same worker have their latency inflated; a single Node process serialises everything and quickly overloads.

Suggestion:
`await fs.promises.readFile(...)`, or `fs.createReadStream(...).pipe(res)` for streaming.
```
