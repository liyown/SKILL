# Go Code Reviewer Skill

`go-code-reviewer` is an evidence-driven Go backend review skill. It is tuned for production-risk findings, not broad style critique.

## What It Reviews

- Goroutine lifecycle, leaks, channel misuse, errgroup/WaitGroup, race conditions
- Context propagation, cancellation, deadlines, request-scoped values
- Error wrapping (`%w` vs `%v`), sentinel errors, panic/recover, defer error handling
- sqlx / GORM / database/sql: SQL injection, N+1, transactions, connection pool
- gRPC / HTTP: timeouts, retries, status codes, middleware order, graceful shutdown
- Security, authorization, tenant isolation, sensitive logs, SSRF, secrets

## Prompt Loading

Always load `prompts/reviewer.md`. Load scenario prompts only when code evidence requires them.

## Output Contract

If no clear high-risk issue is found:

```text
未发现明确高风险问题。
```

When findings exist, output only findings grouped by Critical / High / Medium / Low. Every finding must include code location, trigger path, production impact, and the smallest useful fix.

## Files

```text
.
├── SKILL.md
├── README.md
├── prompts/
│   ├── reviewer.md
│   ├── concurrency-reviewer.md
│   ├── context-reviewer.md
│   ├── error-reviewer.md
│   ├── sql-reviewer.md
│   ├── rpc-reviewer.md
│   └── security-reviewer.md
└── examples/
```
