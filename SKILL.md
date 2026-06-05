---
name: java-code-reviewer
description: Review Java backend projects, pull requests, diffs, and snippets for high-risk production issues in Spring Boot, Spring Cloud, MyBatis, MyBatis-Plus, Redis, Kafka, Reactor, WebFlux, transactions, concurrency, security, performance, DDD, and microservice architecture. Use when the user asks for Java code review, PR review, diff review, bug risk review, architecture review, or production-risk inspection.
metadata:
  short-description: Strict Java backend code review
---

# Java Code Reviewer

This is the Codex/OpenAI-compatible entrypoint for the platform-neutral `java-code-reviewer` skill. Generic agent runtimes should use `skill.md` and `manifest.json`; all entrypoints share the same review contract.

## Review Workflow

1. Identify the changed behavior, not just changed files.
2. Read enough surrounding code to understand call paths, transaction boundaries, ownership checks, persistence operations, async behavior, and external calls.
3. Focus findings on issues that can cause incidents: data corruption, money loss, authorization bypass, failed consistency, duplicate writes, missed rollbacks, outages, severe performance problems, and security vulnerabilities.
4. Do not invent business rules. Mark uncertain findings as `需要结合上下文确认`.
5. Output only findings. If there are no clear high-risk issues, output exactly:

```text
未发现明确高风险问题。
```

## Prompt Loading

Always load:

- `prompts/reviewer.md`

Load only the prompt files that match the reviewed code:

- `prompts/spring-reviewer.md`: Spring Boot, Spring Cloud, transaction, proxy, validation, async, scheduling, configuration, and resiliency checks.
- `prompts/mybatis-reviewer.md`: MyBatis, MyBatis-Plus, SQL, Wrapper, transaction, batch, and indexing checks.
- `prompts/security-reviewer.md`: authorization, tenant isolation, injection, sensitive data, file handling, SSRF, deserialization, and secret checks.

## Output Format

When findings exist, group them by severity and include concrete evidence:

````markdown
# Critical

## 1. 问题标题

位置：
`类名#方法名` 或具体代码片段

问题：
说明具体错误。

影响：
说明可能导致的线上问题。

建议：
说明应该如何修改。

推荐代码：
```java
// 修改后的代码
```

# High

# Medium

# Low
````

Severity definitions:

- Critical: can cause money loss, data corruption, authorization bypass, service unavailability, or severe security vulnerabilities.
- High: can cause clear business errors, transaction inconsistency, concurrency bugs, or performance incidents.
- Medium: can cause boundary exceptions, maintainability decline, or latent bugs.
- Low: style, naming, light duplication, or non-blocking improvements.

## Review Principles

- Do not produce findings just to fill space.
- Do not output generic advice unrelated to the reviewed code.
- Every finding must explain why it matters.
- Provide corrected code when it is concise and useful.
- Do not rewrite the whole project unless the user explicitly asks for it.
