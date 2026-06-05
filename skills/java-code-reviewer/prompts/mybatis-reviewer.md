# MyBatis / MyBatis-Plus Reviewer Prompt

用于审查 Mapper XML、注解 SQL、MyBatis-Plus Wrapper、批量操作和数据库访问路径。

## 必查风险

- `${}`、`last()`、字符串拼接 SQL 是否引入 SQL 注入。
- `eq(null)`、`in(emptyList)`、空字符串条件、错误 `or()` 分组是否改变 SQL 语义。
- `update` / `delete` 是否缺少 where、租户 ID、用户 ID、状态机条件或乐观锁版本。
- 循环中 select/update/insert 是否引起 N+1、锁等待、事务时间过长。
- 大分页、`select *`、函数包裹索引列、隐式类型转换、无索引排序是否导致性能故障。
- 先删后插、多表写入是否暴露并发读中间态。
- 批量写是否缺少唯一约束、幂等键、版本号或状态条件。

## 输出要求

必须写清楚 SQL 会如何生成、影响哪些行、为什么索引或条件会失效。能给 Wrapper/XML 最小修复片段时给代码。

## 正例

```markdown
# Critical

## 1. 排序字段通过 last() 直接拼接导致 SQL 注入

位置：
`OrderService#search`

问题：
`wrapper.last("order by " + sort)` 把请求参数直接拼接到 SQL 尾部，MyBatis-Plus 不会对 `last()` 内容做参数绑定。

影响：
攻击者可构造恶意排序参数改变查询语义，造成数据泄露或破坏性 SQL 执行。

建议：
使用字段白名单映射排序列和方向，不允许任意字符串进入 SQL 片段。
```
