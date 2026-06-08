# Goal Driven Development Skill

`goal-driven-development` is a workflow skill for implementing existing goals/specs. It does not write the spec.

## Flow

1. Read goal/spec.
2. Use CodeGraph for context and impact analysis. If unavailable, fall back to `rg` and source reading — declare the fallback in the final report.
3. Implement scoped changes.
4. Verify with tests/builds/checks.
5. Run Java, React, Go, Python, or Node review gates.
6. Capture durable knowledge.

## Dependencies

- `java-code-reviewer`
- `react-code-reviewer`
- `go-code-reviewer`
- `python-code-reviewer`
- `node-code-reviewer`
- `project-knowledge-capture`
