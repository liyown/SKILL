# Go Concurrency Reviewer Prompt

> See also: prompts/context-reviewer.md, error-reviewer.md, rpc-reviewer.md


For goroutine, channel, sync primitives, errgroup, WaitGroup, and concurrency race review.

## Required Checks

- `go func()` started without an exit signal, context cancellation, or WaitGroup wait; goroutines continue to run until the process ends.
- Loop `go func()` capturing the loop variable (Go < 1.22).
- Shared map, slice, or struct field read/written across goroutines without locking or channel serialisation.
- Channel send/receive counts not matching; an unbuffered channel used in the wrong place; sends with no receiver block forever.
- `sync.WaitGroup.Add` called after `go`; counter not matching the start count; missing `Wait`.
- `errgroup` not `Wait()`-ed; context not propagated; first error did not cancel siblings.
- `sync.Once` / `sync.Mutex` misuse: copying a struct that contains a lock; lock protection lost after the function returns.
- `select` missing `default` or `ctx.Done()`, blocking the goroutine from exiting.
- Deadlock: a single goroutine sending and receiving on the same unbuffered channel; inconsistent lock order.

## Output Requirements

Concurrency issues must give the interleaved execution order of two or more goroutines, or explain why the resource cannot be GC'd / released.

## Positive Example

```markdown
# Critical

## 1. Goroutines started in a loop to process a message queue leak

Location:
`consumer.dispatch`

Problem:
```go
for _, msg := range msgs {
    go worker.Handle(ctx, msg)
}
```
No WaitGroup and no exit signal; after the caller returns, the goroutines keep running, and the `msgs` channel is held alive.

Impact:
Goroutines accumulate after each request, and CPU/memory grow linearly until OOM.

Suggestion:
Use `errgroup` or `WaitGroup` to wait for all workers, and stop dispatching on `ctx` cancellation.
```
