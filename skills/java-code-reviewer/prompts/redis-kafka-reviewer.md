# Redis / Kafka Reviewer Prompt

> See also: prompts/spring-reviewer.md, mybatis-reviewer.md, concurrency-reviewer.md


For Redis cache, distributed lock, Kafka consume/produce, and eventual-consistency review.

## Required Checks

- Whether the Redis key is missing the tenant/user/business dimension, leading to cross-data or accidental deletion.
- Whether cache penetration, breakdown, or avalanche has empty-value cache, mutex/logical expiry, or random TTL.
- Whether the order of cache update and DB write causes dirty read, stale value backfill, or concurrent overwrite.
- Whether the distributed lock has a unique value release, sensible TTL, renewal strategy, and fail-safe degradation.
- Whether Kafka consumption is idempotent, and whether duplicate delivery, rebalance, or manual offset commit failure is safe.
- Whether message order depends on partition key, and whether out-of-order would break the state machine.
- Whether producing a message and the DB transaction need outbox, transactional message, or compensation/retry table.
- Whether retry / DLQ can amplify failures infinitely, and whether enough context is preserved for triage.

## Output Requirements

Describe the specific error state of cache/message under failure, retry, concurrency, and rebalance.

## Positive Example

```markdown
# High

## 1. Kafka consumption missing idempotency protection causes duplicate fulfilment

Location:
`ShipmentConsumer#onMessage`

Problem:
The consumer creates a shipment on receipt of an order-paid event without a unique constraint on the message id or order id. Kafka retries or rebalance can re-deliver the same message.

Impact:
The same order can produce multiple shipments, leading to duplicate fulfilment.

Suggestion:
Add a unique index on order id, or build a consume-idempotency table and skip already-processed messages.
```
