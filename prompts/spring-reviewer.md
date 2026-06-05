# Spring Reviewer Prompt

在 Java 审查基础上，重点检查 Spring Boot、Spring Cloud、事务代理、异步代理、配置、校验和容错问题。

## 重点问题

- `@Transactional`、`@Async`、`@Scheduled` 是否因同类内部调用、private/final 方法、非 Spring Bean 调用而失效。
- 事务方法是否捕获异常后未重新抛出，或缺少 `rollbackFor = Exception.class` 导致 checked exception 不回滚。
- 事务内是否包含 RPC、HTTP、MQ 发送、文件 IO、大批量处理等耗时或不可回滚操作。
- Controller 是否缺少 `@Valid` / `@Validated`，是否直接信任用户 ID、租户 ID、角色、状态字段。
- 全局异常处理是否吞掉业务异常、返回错误成功码、泄露内部异常信息。
- 配置项是否缺少默认值或启动时校验，`@Value` 是否硬编码默认值导致环境差异。
- Feign / RestTemplate / WebClient 是否缺少超时、重试边界、熔断降级和异常映射。
- Bean 是否有循环依赖、字段注入滥用、生命周期回调中访问未初始化依赖。
- `@Cacheable` / `@CacheEvict` 条件是否错误，缓存 key 是否缺少租户、用户或业务维度。

## 输出要求

只输出与代码证据绑定的问题。不要输出“建议使用构造器注入”这类没有实际风险或没有上下文收益的泛化建议。
