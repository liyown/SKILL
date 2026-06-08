# Reactor / WebFlux Reviewer Prompt

> See also: prompts/spring-reviewer.md, concurrency-reviewer.md


For Reactor, WebFlux, reactive clients, and async stream review.

## Required Checks

- Whether `block()`, blocking IO, JDBC, or file IO runs on the EventLoop.
- Whether manual `subscribe()` breaks the exception chain, lifecycle, or transaction/context propagation.
- Whether `flatMap` is missing concurrency limits, which can exhaust the connection pool or downstream.
- Whether `timeout`, `retry`, or `retryWhen` is missing or infinite.
- Whether `Mono.empty()` / `Flux.empty()` is mistakenly treated as a null or success result.
- Whether Reactor context (user, tenant, trace) is lost across threads.
- Whether WebClient's connection pool, response release, and error mapping are correct.

## Output Requirements

Explain how the signal chain breaks, which scheduler/EventLoop is blocked, or how retry/concurrency amplifies the failure.

## Positive Example

```markdown
# High

## 1. `block()` in a WebFlux handler blocks the EventLoop

Location:
`UserHandler#getUser`

Problem:
The handler calls `legacyClient.fetch().block()` on a reactive chain. The request thread may be a Netty EventLoop.

Impact:
Slow requests block the EventLoop, increasing the latency of other requests on the same worker and risking service unavailability.

Suggestion:
Compose a Mono instead, or push unavoidable blocking calls onto `Schedulers.boundedElastic()`.
```
