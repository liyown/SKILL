# Goal Driven Development Workflow

## 目标

将已有 spec/目标转化为可验证代码变更，并在完成后留下可复用项目知识。不要编写 spec，不要自行扩大需求。

## 阶段

1. Goal intake
   - 读取用户给定 spec、目标、任务描述或 issue。
   - 提取成功标准、明确不做事项、受影响模块、可验证结果。
   - 如果目标缺少可执行入口，先从仓库搜索最接近的实现点；仍无法判断再询问。

2. CodeGraph context
   - 先按 `prompts/codegraph.md` 获取结构上下文。
   - 输出内部工作假设：入口、关键符号、调用链、影响半径、测试入口。
   - 不要把 CodeGraph 当成证明业务规则的唯一来源；业务规则仍以 spec 和代码行为为准。

3. Implementation
   - 按最小可行变更实现目标。
   - 优先使用现有架构、工具、测试框架和命名约定。
   - 需要新增抽象时，必须能减少真实复杂度或匹配已有模式。

4. Verification
   - 运行与变更最接近的测试、类型检查、构建或页面验证。
   - 如果测试不可运行，记录命令、失败原因和替代验证。
   - 前端可视化变更需要浏览器或截图验证；后端行为变更需要单元/集成/接口级验证。

5. Review gate
   - Java/Spring/MyBatis/Redis/Kafka/Reactor 变更调用 `java-code-reviewer`。
   - React/TypeScript/Next.js/Vite 变更调用 `react-code-reviewer`。
   - Critical/High 必须修复或明确标注为 `需要结合上下文确认`，不能静默跳过。

6. Knowledge capture
   - 调用 `project-knowledge-capture`。
   - 只沉淀稳定知识：入口、决策、约束、测试、review 结论。
   - 不沉淀聊天流水、失败尝试、secret、客户隐私或生产数据。

## 完成标准

- 目标实现与 spec 对齐。
- 有代码证据支持关键实现路径。
- 相关验证已运行或记录无法运行原因。
- 代码检视已完成。
- 知识沉淀已写入或明确说明不适用原因。

## 反例

- 只读 spec 后直接改代码，没有做影响分析。
- 测试失败但仍声称完成。
- review gate 发现 Critical/High 后只记录不处理。
- knowledge capture 写成聊天摘要。

## 正例

```markdown
目标：为订单列表增加按支付状态筛选。
CodeGraph：定位 `OrderController#list`、`OrderQueryService#list`、`OrderMapper#selectPage`。
实现：新增 status 参数并透传到查询对象，Mapper 增加非空条件。
验证：运行 `OrderQueryServiceTest` 和 mapper SQL 测试。
Review：java-code-reviewer 未发现明确高风险问题。
沉淀：docs/knowledge/2026-06-05-order-status-filter.md。
```
