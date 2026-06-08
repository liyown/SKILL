---
name: goal-driven-development
description: "Execute existing goals or specs through a structured development workflow: read the goal, use CodeGraph for codebase context and impact analysis, implement scoped changes, verify with tests/builds, run Java, React, Go, Python, or Node review gates, and capture durable project knowledge. Use when the user asks for goal-driven development, spec-driven implementation, CodeGraph-assisted development, or end-to-end feature execution."
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
