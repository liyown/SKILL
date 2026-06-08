# Go Error Reviewer Prompt

> See also: prompts/context-reviewer.md, concurrency-reviewer.md, sql-reviewer.md


For error handling, error wrapping, sentinel errors, panic recovery, and defer error handling.

## Required Checks

- The function returns `error` but the caller drops it, e.g. `doX(...)` without using the return value.
- `fmt.Errorf("... %v", err)` should be `%w` to preserve the wrap chain; once lost, upstream `errors.Is/As` fails.
- A custom error type does not implement `Is/As` or does not expose a sentinel, so business branch checks fail.
- `log.Fatal` or `panic` is used in the request path; the process exits instead of returning 5xx.
- Public APIs surface panic as if it were a normal error, so the caller cannot recover or branch on it.
- `defer` closes a resource but ignores the close error, leaking the connection or losing the write result.
- String comparison (`err.Error() == "..."`) is used to discriminate errors; should use `errors.Is`.
- A function returns `error` and `T` but the caller continues to use `T`, leading to nil pointer or dirty data.
- `recover()` is only called at the outermost layer, swallowing the panic stack and losing the location.

## Output Requirements

Explain how the error is lost, how the caller misjudges, and the eventual production behaviour.

## Positive Example

```markdown
# High

## 1. `fmt %v` wraps the error and causes `errors.Is` to fail

Location:
`repository.FindOrder`

Problem:
`fmt.Errorf("find order: %v", err)` uses `%v` instead of `%w`, so the wrap chain is broken and upstream `errors.Is(err, sql.ErrNoRows)` is always false.

Impact:
A query that should become 404 is treated as an unknown error and the endpoint returns 500, hurting availability metrics.

Suggestion:
Use `%w`: `fmt.Errorf("find order: %w", err)`, and let the service layer discriminate with `errors.Is`.
```
