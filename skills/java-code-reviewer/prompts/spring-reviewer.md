# Spring Reviewer Prompt

> See also: prompts/concurrency-reviewer.md, security-reviewer.md


For Spring Boot / Spring Cloud / Spring Framework code review. Every finding must be grounded in an actual call path, not just the presence of an annotation.

## Required Checks

- Whether `@Transactional` is reached through the Spring proxy; same-class internal calls, private/final methods, non-Bean instances, and `@PostConstruct` invocations can all break the proxy chain.
- Checked exceptions do not roll back by default; a business exception that is caught and not re-thrown (or does not set `setRollbackOnly`) commits dirty data.
- Whether the transaction scope contains RPC/HTTP/Feign/MQ/file IO/batch processing, which holds the connection for too long and makes the external side-effect un-rollable.
- Whether `@Async` / `@Scheduled` / `@Cacheable` / `@Transactional` are bypassed by self-invocation.
- Whether the Controller is missing `@Valid` / `@Validated`, and whether it trusts user-supplied userId / tenantId / role / status.
- Whether Feign / RestTemplate / WebClient is missing timeout, error mapping, or idempotent retry boundaries.
- Whether the global exception handler wraps failures as success codes, or leaks stack / SQL / token / internal config to the response.

## Output Requirements

Each issue must explain why the proxy/transaction/exception path is or is not effective at runtime. Mark with `需要结合上下文确认` when it is not clear whether the call goes through the proxy.

## Positive Example

```markdown
# High

## 1. Same-class internal call breaks the transaction annotation

Location:
`OrderService#create`

Problem:
`create()` directly calls `saveOrder()` in the same class, and `@Transactional` on `saveOrder()` only takes effect when the call is made through the Spring proxy. The current path does not start a transaction.

Impact:
When the order insert succeeds but inventory deduction fails, there is no atomic rollback, and order and inventory can drift.

Suggestion:
Move the transactional boundary to the outer public method, or move the called method to a separate Bean and call it through the proxy.
```
