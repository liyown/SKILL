# Critical

## 1. Object.assign + JSON.parse causes prototype pollution

位置：
`mergeConfig`

问题：
```ts
return Object.assign(defaults, JSON.parse(input));
```
攻击者传入 `{"__proto__":{"isAdmin":true}}`，`Object.assign` 会把 `__proto__` 写入 target 的 prototype。

影响：
所有对象继承 `isAdmin=true`，后续 `if (user.isAdmin)` 误判为管理员，导致越权。

建议：
拒绝 `__proto__`、`constructor`、`prototype` key；用 `Object.create(null)` 作 target；或 `structuredClone` 后手动 Object.defineProperty。

## 2. 同步 fs.readFileSync 在请求路径阻塞 event loop

位置：
`OrderService.loadConfig`

问题：
`fs.readFileSync` 同步阻塞当前 event loop worker。

影响：
同一 worker 上其他请求全部延迟，p99 飙升。

建议：
`await fs.promises.readFile(...)`；或 `fs.createReadStream(...).pipe(res)` 流式返回。

## 3. Status update has no WHERE-clause guard

位置：
`OrderService.pay`

问题：
```ts
prisma.$executeRawUnsafe(
  `UPDATE orders SET status = 'PAID' WHERE id = ${orderId}`,
)
```
不带 `AND status = 'UNPAID'` 旧状态条件；`$executeRawUnsafe` 直接拼字符串。

影响：
并发请求重复扣款；SQL 注入风险（如果 `orderId` 来自不可信输入）。

建议：
绑定参数 + 条件：`UPDATE orders SET status = 'PAID' WHERE id = $1 AND status = 'UNPAID'` 通过 `$executeRaw` 传参；并 `result` 检查 rowcount。

# High

## 1. lost await causes unhandled rejection

位置：
`backgroundJob`

问题：
```ts
doWork(payload);
```
未 `await`，`doWork` 抛错变 unhandled rejection，进程可能被 kill。

影响：
任务失败悄无声息；`unhandledRejection` 事件触发后视配置可能让进程崩溃。

建议：
`await doWork(payload)`；或显式 `.catch(err => logger.error(...))`；或注册全局 `process.on('unhandledRejection', err => { fail-fast })`。

## 2. try/await 后 next(err) 缺 return 导致 double response

位置：
`/pay` route

问题：
```ts
try { await payService.charge(req.body); } catch (e) { next(e); }
res.json({ ok: true });
```
`next(err)` 后没 `return`，`res.json` 仍执行。

影响：
Express 抛 "Cannot set headers after they are sent"，接口状态不确定，可能 double-charge。

建议：
`catch (e) { return next(e); }`。

# Medium

## 1. Module-level mutable Map shared across requests

位置：
`HITS`

问题：
模块级 `Map<number, number[]>` 跨请求、跨 worker 共享。

影响：
限流失效；内存随请求线性增长。

建议：
Redis 原子计数器 + 滑动窗口；或 per-process + LRU 清理。
