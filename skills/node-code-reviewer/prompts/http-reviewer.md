# Node HTTP Reviewer Prompt

> See also: prompts/async-reviewer.md, security-reviewer.md, error-reviewer.md


For Express, Fastify, Koa, Hono, tRPC request handling, middleware order, timeouts, body limits, streaming, and graceful shutdown.

## Required Checks

- `express.json({ limit: '50mb' })` is missing the default body limit; a slow attacker can send a large body to exhaust memory.
- Global `express.urlencoded({ extended: true })` accepts nested objects; combined with `qs` can lead to prototype pollution.
- Middleware order: auth after recover, cors not at the outermost, rate limit after auth so pre-auth attacks can flood.
- Missing `keepAliveTimeout` / `headersTimeout` — Node defaults 5s/60s; Slowloris can exhaust file descriptors.
- Missing `server.timeout` / `server.requestTimeout`; Nginx and Node timeouts out of sync cause 502.
- Route `res.json(...)` with no `return` keeps the middleware chain running.
- Error handler `app.use((err, req, res, next) => {...})` must have 4 parameters; with 3 it is treated as a regular middleware.
- Streaming response missing `Content-Length` / `Content-Type`, not listening to `aborted` event, still writing after the connection drops.
- Fastify `setNotFoundHandler` hitting 404 still tries to access `request.user` and throws NPE.
- tRPC router: `protectedProcedure` is missing middleware; any caller can invoke it.
- Graceful shutdown: `SIGTERM` without `server.close()` waiting for in-flight requests, K8s rolling upgrade drops requests.
- `process.exit(0)` skips draining; connection pool / file descriptors are not released.

## Output Requirements

State which step in the request lifecycle fails, how timeout / cancellation propagates, and the event loop state. Provide a concrete fix.

## Positive Example

```markdown
# High

## 1. Missing `keepAliveTimeout` allows Slowloris to exhaust file descriptors

Location:
`server.ts`

Problem:
```ts
const server = app.listen(3000);
```
No `server.keepAliveTimeout` / `server.headersTimeout`; Node defaults 5s/60s.

Impact:
An attacker can use Slowloris to occupy connections; a few hundred slow requests exhaust file descriptors, and legitimate requests are rejected.

Suggestion:
`server.keepAliveTimeout = 65_000; server.headersTimeout = 66_000;` and adjust to the upstream.
```
