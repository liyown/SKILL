---
name: goal-driven-development
description: "Execute existing goals or specs through a structured development workflow: read the goal, use CodeGraph for codebase context and impact analysis, implement scoped changes, verify with tests/builds, run Java, React, Go, Python, or Node review gates, and capture durable project knowledge — minimizing the risk of a reverted merge, a missed dependency, or a code-review block at PR time. Use when the user asks for goal-driven development, spec-driven implementation, CodeGraph-assisted development, or end-to-end feature execution."
metadata:
  short-description: CodeGraph-assisted development workflow
---

# Goal Driven Development

Use this skill to execute an existing goal or spec. Do not write the spec; consume it as the source of truth.

## Required Loading

Always load:

- `prompts/workflow.md`
- `prompts/codegraph.md`

Invoke dependent skills when relevant:

- `java-code-reviewer` for Java backend changes.
- `react-code-reviewer` for React/TypeScript frontend changes.
- `go-code-reviewer` for Go backend changes.
- `python-code-reviewer` for Python backend changes.
- `node-code-reviewer` for Node.js backend changes.
- `project-knowledge-capture` after implementation and review.

## Workflow Contract

- Ground every implementation decision in the provided goal/spec and repository evidence.
- Prefer CodeGraph MCP for structure, callers, callees, traces, and impact before broad file reads.
- If CodeGraph is unavailable, fall back to `rg` and source reading, and **declare** the fallback in the final report — never silently downgrade.
- Keep implementation scope tied to the goal; do not expand into unrelated refactors.
- Development is not complete until verification, review gate, and knowledge capture are addressed.

## Install Path

When a consumer runs `npx skills add <owner>/skills-registry --skill goal-driven-development`,
the entire `skills/goal-driven-development/` directory is copied to
their local skills directory. The default location is:

```text
~/.claude/skills/goal-driven-development/   # Claude Code
~/.cursor/skills/goal-driven-development/    # Cursor (if applicable)
```

`SKILL.md` is the entrypoint the consumer's agent reads first. The
agent then loads `prompts/workflow.md` and `prompts/codegraph.md` as
the two always-loaded prompts. Scenario-specific reviewer skills
(`java-code-reviewer`, `react-code-reviewer`, `go-code-reviewer`,
`python-code-reviewer`, `node-code-reviewer`) and the
`project-knowledge-capture` skill are **referenced by name** in the
`SKILL.md` body and are NOT auto-installed. The consumer must install
them separately:

```sh
npx skills add <owner>/skills-registry \
  --skill goal-driven-development \
  --skill java-code-reviewer \
  --skill react-code-reviewer \
  --skill go-code-reviewer \
  --skill python-code-reviewer \
  --skill node-code-reviewer \
  --skill project-knowledge-capture
```

If the agent tries to invoke `java-code-reviewer` and that skill is
not installed locally, the invocation will silently no-op or error
in agent-specific ways. The combined install command above is the
supported way to use `goal-driven-development`.
