# CodeGraph Usage Prompt

CodeGraph 默认指 `@colbymchenry/codegraph`。它通过 MCP/CLI 暴露代码知识图谱，适合回答“哪里实现”“谁调用谁”“改这里影响哪里”“调用路径是什么”。

## 优先级

1. CodeGraph MCP
   - 先用 `codegraph_status` 检查索引。
   - 用 `codegraph_context` 获取任务上下文。
   - 用 `codegraph_search` 找符号。
   - 用 `codegraph_callers` / `codegraph_callees` 看上下游。
   - 用 `codegraph_trace` 分析调用路径。
   - 用 `codegraph_impact` 评估变更影响半径。
   - 用 `codegraph_files` 看索引文件结构。

2. CodeGraph CLI
   - MCP 不可用但 CLI 可用时，使用 `codegraph status`、`codegraph context`、`codegraph query`、`codegraph impact`、`codegraph affected`。
   - 如项目未初始化，提示运行 `codegraph init -i`。

3. Fallback
   - CodeGraph 不可用时，降级到 `rg`、语言服务、测试命名和文件阅读。
   - 必须在最终说明中记录：`CodeGraph unavailable, fell back to rg/file inspection`。

## 使用原则

- 架构、调用链、影响范围问题优先用 CodeGraph，而不是盲目 `rg`。
- CodeGraph 输出是导航证据，不是业务规则证明。
- 对关键风险必须回到源码或测试确认。
- 不要为了使用 CodeGraph 而重复调用；拿到足够上下文后就停止探索。

## 典型查询

- 找入口：`codegraph_context` with goal summary。
- 找调用方：`codegraph_callers` on service/handler/function symbol。
- 找影响面：`codegraph_impact` on changed symbol。
- 找路径：`codegraph_trace` from controller/route to persistence/external call。
