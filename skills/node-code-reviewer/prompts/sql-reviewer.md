# Node SQL Reviewer Prompt

> See also: prompts/error-reviewer.md, security-reviewer.md, http-reviewer.md


For Prisma, TypeORM, Sequelize, Knex, `pg`, `mysql2`, and raw driver data access.

## Required Checks

- Prisma `findMany` then `findUnique` per row triggers N+1; use `include` / `select` to join once.
- Prisma `$transaction` containing HTTP / RPC — the transaction holds a DB connection too long and exhausts the pool.
- TypeORM `repository.save` updates all fields by default; missing `@BeforeUpdate` hook or `QueryBuilder` to scope columns.
- Sequelize `bulkCreate({ updateOnDuplicate: [...] })` differs between PG and MySQL; missing columns silently skip updates.
- Knex `where({...})` with `Object.assign(query, req.body)` lets an attacker inject arbitrary filters (IDOR).
- Raw SQL: `pg` / `mysql2` `pool.query(sql, values)` is correct; template-string concatenation is injection.
- Soft-delete / multi-tenant filter: model has `paranoid: true` but the hand-written query misses `deletedAt: null`.
- `prisma.$queryRaw` concatenating `String(req.query.id)` is injection.
- Large pagination `skip: 100000` causes O(n) memory and slow query; use cursor pagination.
- `db.$transaction([...])` rolls back on any failure, but the array runs sequentially — not transactional-grade concurrency.

## Output Requirements

State the actual SQL generated, the connection/transaction lifecycle, and the impact on live latency or data correctness.

## Positive Example

```markdown
# Critical

## 1. List endpoint queries one row at a time in a loop, causing N+1

Location:
`order.controller.list`

Problem:
```ts
const orders = await prisma.order.findMany({ where: { tenantId } });
for (const o of orders) {
  o.items = await prisma.item.findMany({ where: { orderId: o.id } });
}
```
One item query per order.

Impact:
1000 orders = 1000 round-trips, database QPS surges.

Suggestion:
`prisma.order.findMany({ where: { tenantId }, include: { items: true } })`.
```
