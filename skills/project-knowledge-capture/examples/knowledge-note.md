# Order Status Filter

Date: 2026-06-05

## Goal

为订单列表增加按支付状态筛选。

## Key Entrypoints

- `OrderController#list`: HTTP 查询入口。
- `OrderQueryService#list`: 组装查询条件。
- `OrderMapper#selectPage`: 分页 SQL。

## CodeGraph Findings

- `OrderController#list` 调用 `OrderQueryService#list`，最终进入 `OrderMapper#selectPage`。
- 影响范围集中在订单查询链路。

## Decisions

- Context: 需要复用现有分页接口。
- Decision: 在 `OrderQuery` 增加 nullable `status`，Mapper 非空时追加条件。
- Consequences: 后续查询条件继续收敛到 `OrderQuery`，避免 Controller 直接拼 SQL。

## Verification

- `OrderQueryServiceTest` passed.

## Review Conclusions

未发现明确高风险问题。
