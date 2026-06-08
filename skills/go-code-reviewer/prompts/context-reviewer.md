# Go Context Reviewer Prompt

> See also: prompts/concurrency-reviewer.md, error-reviewer.md, rpc-reviewer.md


For context propagation, cancellation, timeout deadlines, request-scoped values, and goroutine derivation.

## Required Checks

- The request entry receives `ctx` but downstream calls use `context.Background()` or `context.TODO()`, dropping the request's cancellation signal.
- Context is not propagated through the call chain (e.g. context is stored in a struct instead of being a function parameter).
- `ctx.Done()` is not selected on, so goroutines do not stop on request cancellation.
- Timeouts are too short / too long, or missing, so slow requests hold resources indefinitely.
- `context.WithValue` abuse: passing business parameters through context, unexported key types, deep value chains.
- The `cancel` function returned by `context.WithCancel` is not called, so the context is not released and the parent chain hangs.
- A `context.WithTimeout` is created in HTTP middleware but the response is already written and the cancel is never invoked.
- Long-lived resources (`database/sql`, `http.Client`, `grpc.ClientStream`) are not bound to `ctx`.

## Output Requirements

Explain where in the chain the context is lost, why the goroutine cannot exit, and the impact on the live request or resources.

## Positive Example

```markdown
# High

## 1. Background goroutine using `Background` cannot be stopped on request cancel

Location:
`report.Generate`

Problem:
```go
go func() {
    rows, _ := db.Query(context.Background(), query)
    ...
}()
```
The request ctx is not passed into the goroutine, and the downstream SQL does not cancel with the request.

Impact:
The user has disconnected, but the SQL still runs to completion and continues to hold a connection.

Suggestion:
Pass the request ctx: `go func() { db.Query(ctx, query) }()`, and use `ctx.Done()` to control select exit.
```
