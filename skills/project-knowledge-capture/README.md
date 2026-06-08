# Project Knowledge Capture Skill

`project-knowledge-capture` writes durable project knowledge after implementation.

## Default Output

- `docs/knowledge/index.md`
- `docs/knowledge/YYYY-MM-DD-<goal-slug>.md`

## Captures

- Goal and context
- Key code entrypoints
- CodeGraph findings, or the exact fallback line `CodeGraph unavailable; context was gathered by rg/file inspection.` followed by the `rg` queries and files consulted
- Decisions and consequences
- Verification results
- Review conclusions

It does not capture chat transcripts, temporary failure logs, secrets, customer data, or production data.
