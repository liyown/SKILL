# Java Code Reviewer Skill

`java-code-reviewer` is an evidence-driven Java backend review skill. It is tuned for production-risk findings, not broad style critique.

## What It Reviews

- Business correctness, state transitions, idempotency, duplicate submission
- Null, boundary, exception, transaction, and concurrency paths
- Spring proxy behavior, rollback rules, async/scheduled/cache annotations
- MyBatis / MyBatis-Plus SQL generation, Wrapper conditions, tenant filters, bulk writes
- Security, authorization, tenant isolation, injection, sensitive logs
- Redis/Kafka consistency, retries, ordering, duplicate delivery
- Reactor/WebFlux blocking, subscription, timeout, retry, context, EventLoop usage

## Prompt Loading

Always load `prompts/reviewer.md`. Load scenario prompts only when code evidence requires them.

## Output Contract

If no clear high-risk issue is found:

```text
未发现明确高风险问题。
```

When findings exist, output only findings grouped by Critical / High / Medium / Low. Every finding must include code location, trigger path, production impact, and the smallest useful fix.

## Files

```text
.
├── SKILL.md
├── manifest.json
├── agents/openai.yaml
├── prompts/
│   ├── reviewer.md
│   ├── spring-reviewer.md
│   ├── mybatis-reviewer.md
│   ├── security-reviewer.md
│   ├── concurrency-reviewer.md
│   ├── reactor-reviewer.md
│   └── redis-kafka-reviewer.md
└── examples/
```
