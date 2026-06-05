# Java Code Reviewer Skill

`java-code-reviewer` is a platform-neutral prompt skill for strict Java backend code review. It focuses on production-risk issues rather than generic style comments.

## What It Reviews

- Business correctness, idempotency, duplicate submission, and state transitions
- Null and boundary risks
- Transaction consistency and Spring proxy failures
- Concurrency safety, distributed locks, async work, and duplicate consumption
- MyBatis / MyBatis-Plus SQL, Wrapper, batch, and indexing risks
- Security issues such as authorization bypass, SQL injection, tenant leaks, sensitive logs, path traversal, SSRF, command injection, and secrets
- Performance issues in DB, cache, RPC, JSON, regex, streams, and large collections
- Reactor / WebFlux misuse
- DDD and layered architecture problems

## Entry Points

- `skill.md`: platform-neutral entrypoint for any agent runtime
- `SKILL.md`: Codex/OpenAI-compatible entrypoint
- `manifest.json`: portable package metadata
- `agents/openai.yaml`: optional OpenAI UI metadata

## Usage

Load `skill.md`, then load `prompts/reviewer.md`. Add scenario prompts only when they match the reviewed code:

- `prompts/spring-reviewer.md`
- `prompts/mybatis-reviewer.md`
- `prompts/security-reviewer.md`

Example invocation:

```text
Use java-code-reviewer to review this Java PR diff. Only output production-risk findings.
```

## Output Contract

If no clear high-risk issue is found:

```text
未发现明确高风险问题。
```

If findings exist, group them by severity:

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

## Build

Validate the package:

```sh
./scripts/validate.sh
```

Build distributable artifacts:

```sh
./scripts/build.sh
```

Artifacts are written to `dist/`:

- `java-code-reviewer-<version>.tar.gz`
- `java-code-reviewer-<version>.zip`, when `zip` is available
- `SHA256SUMS`

## Repository Layout

```text
.
├── SKILL.md
├── skill.md
├── manifest.json
├── agents/
│   └── openai.yaml
├── examples/
│   ├── bad-service.java
│   ├── pr-diff-example.diff
│   └── review-output.md
├── prompts/
│   ├── reviewer.md
│   ├── spring-reviewer.md
│   ├── mybatis-reviewer.md
│   └── security-reviewer.md
└── scripts/
    ├── build.sh
    └── validate.sh
```

## License

MIT
