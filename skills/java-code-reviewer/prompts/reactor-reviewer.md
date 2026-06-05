# Reactor / WebFlux Reviewer Prompt

用于 Reactor、WebFlux、响应式客户端和异步流审查。

## 必查风险

- `block()`、阻塞 IO、JDBC、文件 IO 是否运行在 EventLoop 上。
- 手动 `subscribe()` 是否导致异常链断裂、生命周期失控、事务/上下文丢失。
- `flatMap` 是否缺少并发度限制，可能压垮连接池或下游。
- `timeout`、`retry`、`retryWhen` 是否缺失或无限重试。
- `Mono.empty()` / `Flux.empty()` 是否被误当成 null 或成功结果。
- Reactor Context 中的用户、租户、trace 是否跨线程丢失。
- WebClient 连接池、响应释放、错误状态映射是否正确。

## 输出要求

说明信号链如何断裂、在哪个 scheduler/EventLoop 上阻塞、或重试/并发如何放大故障。

## 正例

```markdown
# High

## 1. WebFlux 链路中 block() 会阻塞 EventLoop

位置：
`UserHandler#getUser`

问题：
handler 在响应式链路中调用 `legacyClient.fetch().block()`，请求线程可能是 Netty EventLoop。

影响：
慢请求会阻塞 EventLoop，导致同一 worker 上其他请求延迟甚至服务不可用。

建议：
改为组合 Mono，或把不可避免的阻塞调用放到 `Schedulers.boundedElastic()`。
```
