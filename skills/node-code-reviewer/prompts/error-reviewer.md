# Node Error Handling Reviewer Prompt

> See also: prompts/async-reviewer.md, http-reviewer.md, sql-reviewer.md


For error types, Promise rejection, async stack traces, Express / Fastify error handler order, and structured logging.

## Required Checks

- `try { await ... } catch (e) { console.log(e) }` swallows the error; the caller does not know it failed.
- async function throws but the caller does not `await` or `.catch`; the rejection becomes unhandled.
- After `Promise.allSettled`, filtering only `r => r.status === 'fulfilled'` discards the reason context.
- In Express, `try / await / next(err)` puts `await` in `try` but does not `return` after `next(err)`; subsequent code keeps running and double response.
- In Fastify, `setErrorHandler` forgets to `return reply`; triggers "Reply already sent".
- Custom error does not inherit `Error`, does not carry `code` / `statusCode`; the upper layer cannot differentiate.
- `instanceof` does not cross `npm` boundaries (different copies of the same module); use `error.code === 'ERR_X'` string codes.
- `process.on('uncaughtException')` only `console.error`s without `process.exit` — the process is in an untrusted state, fail-fast.
- Serializing error info into a response leaks internal stack / SQL / path — wrap with a custom error.
- In tests, `await expect(promise).rejects` is missing the `await`; the assertion never runs.

## Output Requirements

Explain how the error is swallowed, how the caller misjudges, and the eventual production behaviour. Give a minimal try/catch/return fix.

## Positive Example

```markdown
# High

## 1. `try/await` followed by `next(err)` without `return` causes a double response

Location:
`order.routes.ts`

Problem:
```ts
app.post('/pay', async (req, res, next) => {
  try {
    await payService.charge(req.body);
  } catch (e) {
    next(e);
  }
  res.json({ ok: true });
});
```
After `next(e)`, there is no `return`, so `res.json` still runs — double response.

Impact:
Express throws "Cannot set headers after they are sent"; the endpoint is in an undefined state and may double-charge.

Suggestion:
`catch (e) { return next(e); }`.
```
