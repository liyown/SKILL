# Python SQL Reviewer Prompt

> See also: prompts/error-reviewer.md, security-reviewer.md, web-reviewer.md


For SQLAlchemy, Django ORM, async session, Tortoise, Peewee, and raw cursor data-access layers.

## Required Checks

- `session.execute(select(...))` / `Order.objects.get(id=...)` in a loop triggers N+1; should use `selectinload` / `prefetch_related` once.
- Async session: `AsyncSession` shared across tasks — sessions are not coroutine-safe; each task must have its own `async with sessionmaker() as session:`.
- Transaction boundary: missing `await session.commit()`, exception path missing `await session.rollback()`, operations outside `session.begin()`.
- SQLAlchemy `text(...)` with string concatenation, missing `.params()`, equivalent to f-string injection.
- Django ORM `Model.objects.filter(**request.query_params)` lets an attacker inject IDOR filters.
- Soft-delete / multi-tenant filter: `Model.objects.all()` without tenant condition, leading to cross-tenant reads.
- `lazy="select"` / default load strategy triggers N+1 in the serializer layer (DRF `ModelSerializer` with many rows).
- Large pagination `OFFSET 100000` causes slow queries; switch to `WHERE id > ? LIMIT ?` cursor pagination.
- Raw cursor path: `cursor.execute(query, params)` with `params` (correct) vs string `%s` + tuple (correct), but `cursor.execute(f"... {var}")` is injection.
- Connection pool: `pool_size` / `max_overflow` / `pool_recycle` missing or too large, causing stale connections or avalanches.

## Output Requirements

State the actual SQL generated, the connection/transaction lifecycle, and the impact on live latency or data correctness.

## Positive Example

```markdown
# Critical

## 1. List endpoint queries one row at a time in a loop, causing N+1

Location:
`order.api.list_orders`

Problem:
```python
orders = Order.objects.filter(tenant_id=tenant)
for o in orders:
    o.items  # triggers lazy load
```
For each order, runs `SELECT * FROM items WHERE order_id = ?` separately.

Impact:
1000 orders = 1000 round-trips, database QPS surges.

Suggestion:
`orders = Order.objects.select_related('items').filter(tenant_id=tenant)` or `prefetch_related('items')`.
```
