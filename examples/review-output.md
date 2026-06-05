# Critical

## 1. 支付扣款缺少订单归属和幂等并发控制

位置：
`BadOrderService#doPay`

问题：
方法只按 `orderId` 查询订单，没有校验订单是否属于当前 `userId`，并且 `PAID` 判断和后续扣款、改状态之间没有状态条件更新或幂等流水约束。并发请求可能同时读到未支付状态并重复扣款。

影响：
可能导致越权支付其他用户订单、重复扣款和订单状态错乱，属于资损风险。

建议：
按 `orderId + userId` 查询订单，扣款前后使用唯一支付流水或带旧状态条件的更新保证幂等；扣款和状态更新失败时要有明确补偿或一致性设计。

推荐代码：
```java
Order order = orderMapper.selectByIdAndUserId(orderId, userId);
if (order == null) {
    throw new BizException("订单不存在");
}
if ("PAID".equals(order.getStatus())) {
    return;
}

int updated = orderMapper.markPaying(orderId, userId, "UNPAID", "PAYING");
if (updated != 1) {
    return;
}
```

## 2. SQL 排序字段直接拼接导致注入

位置：
`BadOrderService#search`

问题：
`wrapper.last("order by " + sort)` 将外部传入的 `sort` 直接拼接进 SQL，`last()` 不会做参数绑定。

影响：
攻击者可构造恶意排序参数改变 SQL 语义，造成数据泄露、异常查询或破坏性 SQL 执行，具体影响取决于数据库和连接权限。

建议：
使用白名单映射排序字段和方向，不允许任意字符串进入 SQL 片段。

推荐代码：
```java
Map<String, String> sortColumns = Map.of(
    "createdTime", "created_time",
    "amount", "amount"
);
String column = sortColumns.getOrDefault(sort, "created_time");
wrapper.orderByDesc(column);
```

# High

## 1. 同类方法内部调用导致事务不生效

位置：
`BadOrderService#pay`

问题：
`pay()` 直接调用同类中的 `doPay()`，Spring AOP 代理不会拦截该内部调用，`doPay()` 上的 `@Transactional` 可能不生效。

影响：
扣款、远程支付和订单状态更新无法保证事务边界；异常时可能出现账户已扣减但订单未更新的中间状态。

建议：
将事务方法移动到独立 Bean，通过 Spring 代理调用；或让外层公开方法承载事务边界。

# Medium

## 1. 订单和账户对象未判空直接访问

位置：
`BadOrderService#doPay`

问题：
`orderMapper.selectById(orderId)` 和 `accountMapper.selectByUserId(userId)` 可能返回 null，后续直接访问 `order.getStatus()`、`order.getAmount()`、`account.getPayToken()`。

影响：
非法订单 ID、已删除账户或脏数据会触发 NPE，导致接口 500。

建议：
对查询结果做显式判空，并返回业务错误。

# Low

## 1. 批量取消在循环中逐条查库和更新

位置：
`BadOrderService#batchCancel`

问题：
每个订单都单独查询和更新，订单数量大时会产生大量数据库往返。

影响：
批量操作耗时随订单数线性放大，可能拖慢接口并增加数据库压力。

建议：
批量查询订单后按条件批量更新，或限制批量大小并分批提交。
