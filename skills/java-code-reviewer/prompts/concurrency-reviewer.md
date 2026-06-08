# Java Concurrency Reviewer Prompt

> See also: prompts/spring-reviewer.md, redis-kafka-reviewer.md


For concurrency, idempotency, locks, thread pools, cache races, and async tasks.

## Required Checks

- Whether duplicate submit, duplicate consumption, duplicate deduction, or duplicate write has a unique constraint, idempotency key, status condition, or version protection.
- Whether read-then-modify has a race that requires conditional update or optimistic lock.
- Whether the distributed lock key includes the business-unique dimension, has a sane TTL, renewal strategy, fail-safe release, and is not overly scoped.
- Whether static mutable objects, singleton Bean fields, or non-thread-safe collections are shared across threads.
- Whether ThreadLocal is removed in `finally` so thread pool reuse does not leak user/tenant context.
- Whether async task exceptions are lost, and whether the thread pool queue, rejection policy, and timeout can take down the service.
- Whether cache updates have concurrent overwrite, double-delete failure, or cache/DB inconsistency.

## Output Requirements

Concurrency issues must give the interleaved execution order of two or more requests or messages that produce the failure.

## Positive Example

```markdown
# Critical

## 1. Read-then-modify on payment status leads to concurrent double-charge

Location:
`PaymentService#pay`

Problem:
Two requests both read `UNPAID` and execute the deduction, then each updates to `PAID`. The update statement has no old-status condition or version.

Impact:
The same order can be charged multiple times; this is a capital-loss risk.

Suggestion:
Use a conditional update such as `where id = ? and status = 'UNPAID'` to claim the payment state, or rely on a unique payment-flow row for idempotency.
```
