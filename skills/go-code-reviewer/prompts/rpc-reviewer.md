# Go RPC / HTTP Reviewer Prompt

> See also: prompts/context-reviewer.md, concurrency-reviewer.md, error-reviewer.md


For gRPC, HTTP/JSON, middleware, timeout, retry, status codes, streaming calls, and graceful shutdown.

## Required Checks

- `http.Client` or `*Server` has no `Timeout`; slow responses hold connections indefinitely.
- gRPC `Dial` has no timeout, blocking mode, or keepalive; client streaming does not handle cancel.
- Retry: non-idempotent operations (POST, charge) retry blindly and cause duplicate writes; missing backoff or jitter.
- HTTP middleware order: auth after recover, so a panic can hit unauthenticated paths; CORS, trace, metrics out of order.
- Wrong status code semantics: business failure returns 200; business errors should be 4xx/5xx.
- Oversized response body, no body size limit, no decompression-bomb defence.
- gRPC interceptor missing panic recover, not passing metadata, not handling deadline.
- Server `signal.Notify` listening incomplete; `http.Server.Shutdown` without context deadline; connections still arriving after `Shutdown`.
- `panic` without recover middleware, the process crashes.

## Output Requirements

State which stage of the call chain loses control, how slow calls exhaust resources, and what is observed in production.

## Positive Example

```markdown
# High

## 1. `http.Server` missing `ReadHeaderTimeout` allows slow clients to exhaust connections

Location:
`main`

Problem:
```go
srv := &http.Server{Addr: ":8080", Handler: mux}
log.Fatal(srv.ListenAndServe())
```
No `ReadHeaderTimeout` / `ReadTimeout` / `IdleTimeout`; Slowloris or slow clients keep a connection open indefinitely.

Impact:
An attacker can exhaust the listening port with a small number of connections, rejecting legitimate requests.

Suggestion:
At minimum set `srv.ReadHeaderTimeout = 5 * time.Second`, and tune `ReadTimeout/WriteTimeout` as needed.
```
