# MyBatis / MyBatis-Plus Reviewer Prompt

> See also: prompts/spring-reviewer.md, security-reviewer.md, redis-kafka-reviewer.md


For Mapper XML, annotated SQL, MyBatis-Plus wrapper, batch operations, and the data-access path.

## Required Checks

- Whether `${}`, `last()`, or string-concatenated SQL introduces SQL injection.
- Whether `eq(null)`, `in(emptyList)`, empty-string conditions, or mis-grouped `or()` change the SQL semantics.
- Whether `update` / `delete` is missing the WHERE, tenant id, user id, status machine condition, or optimistic-lock version.
- Whether the loop contains select/update/insert that triggers N+1, lock waits, or long-running transactions.
- Whether large pagination, `select *`, indexed columns wrapped in functions, implicit type conversion, or unsorted indexes cause performance failure.
- Whether delete-then-insert or multi-table write exposes a concurrent read mid-state.
- Whether the batch write is missing a unique key, idempotency key, version, or status condition.

## Output Requirements

Write clearly how the SQL is generated, which rows it affects, and why the index or condition fails. Provide a minimal wrapper/XML fix when possible.

## Positive Example

```markdown
# Critical

## 1. Sort field concatenated via `last()` enables SQL injection

Location:
`OrderService#search`

Problem:
`wrapper.last("order by " + sort)` concatenates the request parameter directly into the SQL tail. MyBatis-Plus does not bind parameters inside `last()`.

Impact:
An attacker can craft a malicious sort parameter to alter query semantics, leading to data leakage or destructive SQL execution depending on database and connection privileges.

Suggestion:
Map the sort column and direction through a whitelist; never let arbitrary strings reach a SQL fragment.
```
