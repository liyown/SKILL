# Go SQL Reviewer Prompt

> See also: prompts/error-reviewer.md, security-reviewer.md, rpc-reviewer.md


For database/sql, sqlx, GORM, ent data-access layer SQL generation, connection pool, transactions, and N+1.

## Required Checks

- `QueryRow` is called but `Scan` is not, so errors are never detected.
- String concatenation, fmt.Sprintf building SQL, no `?` placeholder or prepared statement — SQL injection.
- Transactions: `Begin` without `defer Tx.Rollback`, missing `Commit`, RPC/HTTP inside a transaction, external side-effects cannot be rolled back.
- Connection pool: `SetMaxOpenConns` missing or too large; `SetConnMaxLifetime` missing causing stale connections; slow query occupying all connections.
- N+1: `Query/QueryRow` in a loop, should be a single `IN (...)` query or preload.
- Missing index or sort field not hitting an index; large `OFFSET` pagination causing slow queries.
- Soft-delete / multi-tenant filter missing, leading to cross-tenant or deleted-row reads.
- Bulk row load: `db.Query` and `rows.Next` accumulate into a slice with no streaming, exhausting memory.
- GORM: `Preload` misuse triggering N+1; `Save` full-field update conflicting with concurrent updates.

## Output Requirements

State the actual SQL generated, the connection/transaction lifecycle, and the impact on live latency or data correctness.

## Positive Example

```markdown
# Critical

## 1. List endpoint queries one row at a time in a loop, causing N+1

Location:
`order.List`

Problem:
```go
for _, id := range orderIDs {
    var o Order
    if err := db.Get(&o, "SELECT * FROM orders WHERE id = ?", id); err != nil {
        return nil, err
    }
    items = append(items, o)
}
```
One query per id; for N=1000, that's 1000 round-trips.

Impact:
The list endpoint's RT scales linearly with order count, and database QPS surges, which can slow the entire database.

Suggestion:
A single `SELECT * FROM orders WHERE id IN (?, ?, ?)`, or preload into a map at the service layer.
```
