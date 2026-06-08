# Order Status Filter

Date: 2026-06-05

## Goal

Add a payment-status filter to the order list.

## Key Entrypoints

- `OrderController#list`: HTTP query entry.
- `OrderQueryService#list`: assembles the query conditions.
- `OrderMapper#selectPage`: paginated SQL.

## CodeGraph Findings

- `OrderController#list` calls `OrderQueryService#list`, which eventually reaches `OrderMapper#selectPage`.
- The impact radius is concentrated in the order query chain.

## Decisions

- Context: must reuse the existing paginated endpoint.
- Decision: add a nullable `status` on `OrderQuery`; the Mapper only appends the condition when non-empty.
- Consequences: future filter conditions should also converge in `OrderQuery` to prevent the Controller from building SQL directly.

## Verification

- `OrderQueryServiceTest` passed.

## Review Conclusions

未发现明确高风险问题。
