# Project Knowledge Capture Prompt

> See also: (none — this is the only prompt in this skill)


## Goal

Persist project knowledge that remains valuable after a development task is complete, into the repository's documentation. The output should help future developers quickly understand "why was this done", "where is the entry point", and "what to be careful about when changing this later".

## Default Locations

- `docs/knowledge/index.md`
- `docs/knowledge/YYYY-MM-DD-<goal-slug>.md`

`goal-slug` uses lowercase English letters, digits, and dashes; if the goal has no English name, generate a short slug from the code domain.

## Writing Rules

- Write only stable facts and made decisions.
- Use code paths, class names, component names, and test commands as evidence.
- If the content came from CodeGraph, label it "CodeGraph findings".
- Do not record chat transcripts, failed attempts, temporary command output, model thinking, or unverified guesses.
- Do not write secrets, tokens, customer privacy data, production data, or sensitive logs.

## Note Template

```markdown
# <Goal Title>

Date: YYYY-MM-DD

## Goal

The current goal and the final delivered scope.

## Context

Relevant business / technical background; only the parts future readers will reuse.

## Key Entrypoints

- `path/File.ext`: the entry's responsibility.

## CodeGraph Findings

- Key symbols, call chain, impact radius.
- If CodeGraph is unavailable:
  `CodeGraph unavailable; context was gathered by rg/file inspection.`
  Next line: list the `rg` queries used and the files read.
- Fallback evidence is "tooling", not "decision".

## Decisions

- Context: the problem or constraint at the time.
- Decision: the chosen approach.
- Consequences: the gains, costs, and caveats going forward.

## Verification

- Tests / builds / type checks that were run.
- If something could not be run, record the reason.

## Review Conclusions

- Java / React / Go / Python / Node reviewer Critical/High conclusions.
- If no high-risk issues: `未发现明确高风险问题。`

## Follow-up Notes

- Stable constraints to keep in mind for future changes.
```

## Index Update Rule

`docs/knowledge/index.md` should at least contain:

```markdown
# Project Knowledge

| Date | Topic | Summary |
| --- | --- | --- |
| YYYY-MM-DD | [Goal Title](YYYY-MM-DD-goal-slug.md) | One-line summary |
```

Insert the latest record in reverse chronological order.

## Anti-example

Do not write:

```markdown
Today the tests failed, I retried three times, eventually it worked.
```

That is process noise, not project knowledge.

## Positive Example

```markdown
## Decisions

- Context: the order status filter must reuse the existing paginated endpoint; a new query entry is not allowed.
- Decision: add a nullable `status` on `OrderQuery`; the Mapper only appends the condition when non-empty.
- Consequences: future filter conditions should also converge in `OrderQuery` to prevent the Controller from building SQL directly.
```
