# Critical

## 1. 支付扣款缺少订单归属和并发状态保护

位置：
`example.BadOrderService.Pay`

问题：
方法按 `orderID` 查询订单后直接扣款，没有校验 `order.UserID == userID`，也没有带旧状态的条件更新。并发请求可能同时读到未支付状态并重复扣款。

影响：
可能导致越权支付其他用户订单、重复扣款和订单状态错乱，属于资损风险。

建议：
按 `orderID + userID` 查询订单；扣款前后使用唯一支付流水或带旧状态的条件更新保证幂等；扣款和状态更新失败时要有明确补偿或一致性设计。

推荐代码：
```go
var o Order
err := s.db.QueryRowContext(ctx, "SELECT id, user_id, amount, status FROM orders WHERE id = ? AND user_id = ?", orderID, userID).Scan(...)
if errors.Is(err, sql.ErrNoRows) {
    return ErrOrderNotFound
}
res, err := s.db.ExecContext(ctx, "UPDATE orders SET status = 'PAYING' WHERE id = ? AND status = 'UNPAID'", orderID)
if n, _ := res.RowsAffected(); n != 1 {
    return ErrConcurrentUpdate
}
```

## 2. SQL 直接字符串拼接导致注入

位置：
`example.BadOrderService.Pay`

问题：
`fmt.Sprintf("SELECT ... WHERE id = %d", orderID)` 把整数拼到 SQL 中，未使用 `?` 占位符或 prepared statement。若 `orderID` 类型后续被弱化为 string 或上游允许可控输入，将出现 SQL 注入。

影响：
攻击者可控输入可改变 SQL 语义，造成数据泄露、破坏性写入或权限绕过。

建议：
统一使用 `?` 占位符：`s.db.QueryRowContext(ctx, "SELECT ... WHERE id = ?", orderID)`。

# High

## 1. goroutine 启动后无法随请求取消而停止

位置：
`example.BadOrderService.Pay`

问题：
```go
go func() {
    for m := range msgs {
        handleMessage(context.Background(), m)
    }
}()
```
启动时未与 `ctx.Done()` 联动，handler 又使用 `context.Background()`，请求取消时 goroutine 不会被中断。

影响：
用户断开后 worker 仍在持续处理消息并占用下游资源，goroutine 数量随流量线性累积。

建议：
传入请求 ctx：`go func() { for m := range msgs { handleMessage(ctx, m) } }()`，并 `defer close(msgs)` 或在 `ctx.Done()` 后退出。

## 2. fmt %v 包装错误导致 errors.Is 失败

位置：
`example.BadOrderService.Pay`

问题：
`fmt.Errorf("order paid: %v", sql.ErrNoRows)` 使用 `%v`，wrap 链断裂，上游 `errors.Is(err, sql.ErrNoRows)` 永远为 false。

影响：
本应转化为 404/业务已支付的查询会被当成未知错误返回 5xx，影响可用性指标。

建议：
改用 `%w`：`fmt.Errorf("order paid: %w", sql.ErrNoRows)`。

## 3. HTTP 客户端无超时 + 请求路径 log.Fatal

位置：
`example.BadOrderService.Pay`

问题：
`http.Client` 未设置 `Timeout`，且慢请求失败时调用 `log.Fatal`，导致进程直接退出。

影响：
下游支付服务抖动时，本服务会被整个进程终止，错误半径扩大。

建议：
为 `http.Client` 设置合理超时；`log.Fatal` 改为返回 error，由上层决定是否降级或熔断。

# Medium

## 1. 锁被值接收者复制失去保护

位置：
`example.Counter.Inc`

问题：
`Counter` 使用值接收者，`c.mu.Lock()` 复制了一份 mutex，原 `c.mu` 的状态不再反映到调用方。

影响：
并发调用 `Inc` 时不同副本上的锁互不感知，`c.n` 会出现 race。

建议：
改为指针接收者 `(c *Counter) Inc()`，并在调用处使用 `&counter`。

# Low

## 1. 错误日志缺上下文

位置：
`example.BadOrderService.Pay`

问题：
`log.Fatal(err)` 没有 `orderID`、`userID` 等关键维度，事后排障困难。

建议：
使用结构化日志并附加 `order_id`、`user_id` 字段后再退出或返回 error。
