# Project Knowledge Capture Prompt

## 目标

把开发完成后仍然有价值的项目知识沉淀到仓库文档中。输出应该帮助未来开发者快速理解“为什么这么做”“入口在哪里”“以后改哪里要小心”。

## 默认位置

- `docs/knowledge/index.md`
- `docs/knowledge/YYYY-MM-DD-<goal-slug>.md`

`goal-slug` 使用小写英文、数字和连字符；如果目标没有英文名称，根据代码域生成简短 slug。

## 写入规则

- 只写稳定事实和已做决策。
- 用代码路径、类名、组件名、测试命令作为证据。
- 如果来自 CodeGraph，记录为 “CodeGraph findings”。
- 不记录聊天流水、失败尝试、临时命令输出、模型思考、未验证猜测。
- 不写 secret、token、客户隐私、生产数据、敏感日志。

## 笔记模板

```markdown
# <Goal Title>

Date: YYYY-MM-DD

## Goal

本次目标和最终完成范围。

## Context

相关业务/技术背景，只写未来会复用的信息。

## Key Entrypoints

- `path/File.ext`: 说明入口职责。

## CodeGraph Findings

- 关键符号、调用链、影响半径。
- 如果 CodeGraph 不可用，写：`CodeGraph unavailable; context was gathered by rg/file inspection.`

## Decisions

- Context: 当时面对的问题或约束。
- Decision: 已采用的方案。
- Consequences: 后续收益、代价、需要注意的地方。

## Verification

- 运行过的测试/构建/类型检查。
- 无法运行时记录原因。

## Review Conclusions

- Java/React reviewer 的 Critical/High 结论。
- 若无高风险：`未发现明确高风险问题。`

## Follow-up Notes

- 后续改动时需要注意的稳定约束。
```

## Index 更新规则

`docs/knowledge/index.md` 至少包含：

```markdown
# Project Knowledge

| Date | Topic | Summary |
| --- | --- | --- |
| YYYY-MM-DD | [Goal Title](YYYY-MM-DD-goal-slug.md) | 一句话摘要 |
```

按日期倒序插入最新记录。

## 反例

不要写：

```markdown
今天先运行测试失败，然后改了三次，最后好了。
```

这是过程噪音，不是项目知识。

## 正例

```markdown
## Decisions

- Context: 订单状态筛选需要复用现有分页接口，不能新增查询入口。
- Decision: 在 `OrderQuery` 增加 nullable `status`，Mapper 只在非空时追加条件。
- Consequences: 后续新增筛选条件应继续收敛在 `OrderQuery`，避免 Controller 直接拼 SQL。
```
