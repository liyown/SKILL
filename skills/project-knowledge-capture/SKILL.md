---
name: project-knowledge-capture
description: "Capture durable project knowledge after implementation: goals, context, key entrypoints, CodeGraph findings, decisions, verification results, review conclusions, and follow-up notes into docs/knowledge. Use when development completes and project knowledge should be preserved without secrets or process noise."
metadata:
  short-description: Capture durable project knowledge
---

# Project Knowledge Capture

Capture stable project knowledge after a development task. This is not a chat transcript and not a changelog.

## Required Loading

Always load `prompts/capture.md`.

## Contract

- Default target directory: `docs/knowledge/`.
- Create or update `docs/knowledge/index.md`.
- Create `docs/knowledge/YYYY-MM-DD-<goal-slug>.md` for the task note.
- Record durable knowledge only: context, entrypoints, decisions, constraints, tests, review conclusions.
- Do not write secrets, tokens, customer data, production data, sensitive logs, or speculative claims.
