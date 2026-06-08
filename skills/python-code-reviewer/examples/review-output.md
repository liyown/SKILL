# Critical

## 1. Module-level mutable dict cross-request state

位置：
`OrderService.pay`

问题：
```python
HITS = {}
...
HITS.setdefault(user_id, []).append(time.time())
```
模块级 dict 跨所有请求、跨所有 worker 共享；ASGI 下请求会交错 `await`，写入无锁。

影响：
限流失效；多 worker 部署时各副本状态不一致；内存随请求数线性增长。

建议：
用 Redis 原子计数器 + 滑动窗口；或至少 per-process 字典 + LRU 清理。

## 2. f-string into raw SQL causes injection

位置：
`OrderService.pay`

问题：
```python
text(f"SELECT * FROM orders WHERE id = {order_id} AND user_id = {user_id}")
```
`text` 不会参数化字符串拼接。

影响：
攻击者构造 `order_id` 输入可改变 SQL 语义、绕过归属校验或拖库。

建议：
用绑定参数：`text("SELECT * FROM orders WHERE id = :id AND user_id = :uid")` 并 `.params(id=order_id, uid=user_id)`。

## 3. Sync requests inside async handler blocks event loop

位置：
`create_order_async`

问题：
`requests.post` 是同步阻塞调用，在 async handler 中会卡住 event loop worker。

影响：
同一 worker 上其他请求全部延迟；高并发下整个服务不可用。

建议：
改 `httpx.AsyncClient` 并 `await client.post(...)`，或 `await asyncio.get_running_loop().run_in_executor(None, requests.post, ...)`。

## 4. Status transition has no WHERE-clause guard

位置：
`OrderService.pay`

问题：
```python
text(f"UPDATE orders SET status = 'PAID' WHERE id = {order_id}")
```
不带 `AND status = 'UNPAID'` 旧状态条件，并发请求可同时通过校验后重复扣款。

影响：
重复扣款、资损。

建议：
加条件：`WHERE id = :id AND status = 'UNPAID'`；先看 affected rows，0 行则放弃。

## 5. pickle.loads on user input → arbitrary code execution

位置：
`load_blob`

问题：
`pickle.loads` 反序列化时执行任意代码。

影响：
攻击者上传恶意 blob 即可在服务上跑任意命令。

建议：
改用 JSON / MessagePack / protobuf；如必须 pickle，至少校验签名或限制来源为受信队列。

# High

## 1. Fire-and-forget asyncio task loses exceptions

位置：
`fan_out`

问题：
`asyncio.create_task(coro())` 后没持有引用也没 `await`，异常丢失。

影响：
子任务失败不传播，监控看不到；进程重启时丢失在途任务。

建议：
持有 task 引用后 `await`；或在 `create_task` 后注册 `task.add_done_callback(handle_exception)`；或用 `asyncio.TaskGroup` 自动收集。

## 2. except Exception returns None hides failures

位置：
`charge_card`

问题：
捕获后只 `return False`，调用方无法区分"扣款失败"与"未执行"。

影响：
业务上视为成功，导致漏单 / 重复扣款。

建议：
捕获具体异常类型，重抛业务异常：`except PaymentError as e: raise OrderProcessingError("charge failed") from e`。

# Medium

## 1. N+1 in find_orders

位置：
`find_orders`

问题：
对每个 id 单独 `SELECT`，N 个 id = N 次往返。

影响：
大 id 列表时数据库 QPS 暴涨，延迟线性放大。

建议：
用 `IN (?, ?, ...)` 一次查：`text("SELECT id, status FROM orders WHERE id IN :ids")` + `expanding` 参数或手工拼接占位符。
