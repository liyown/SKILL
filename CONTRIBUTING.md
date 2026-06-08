# Contributing

This repository is a collection of skills consumed via the
[`npx skills`](https://skills.sh) CLI. Each skill is a self-contained
folder that gets copied into the consumer's local skills directory
(`~/.claude/skills/<name>/` for Claude Code, etc.). There is no registry
metadata, version coordination, or build step — the folder layout is the
contract.

## Directory Layout

```text
skills/<skill-name>/
├── SKILL.md            # required entrypoint
├── README.md           # human-readable description (optional but recommended)
├── prompts/            # scenario-specific prompt fragments (loaded on demand)
└── examples/           # bad/good code samples and review outputs
```

A new skill must live under its own directory. The directory name is the
canonical skill name and must match `SKILL.md` frontmatter `name`.

## `SKILL.md` Frontmatter

Required fields:

| Field | Type | Constraint |
| --- | --- | --- |
| `name` | string | Must equal the parent directory name. Lowercase, digits, dashes only. |
| `description` | string | ≥ 40 chars. Should describe when to invoke the skill, not just what it is. Include the trigger phrases users are likely to type. |

Optional but recommended:

| Field | Type | Purpose |
| --- | --- | --- |
| `metadata.short-description` | string | One-line summary used by some consumers' listings. |

Frontmatter parsing rules consumers apply:

- The body starts with `---` on its own line and ends with another `---`.
- Quoted strings with `:` or leading whitespace are preserved verbatim.
- Anything below the closing `---` is the body.

## `SKILL.md` Body

The body is what agents see when the skill is invoked. Keep it small and
focused on routing:

1. **Required loading** — which `prompts/*.md` are always loaded
2. **Optional loading** — which `prompts/*.md` to load for specific scenarios
3. **Review/output contract** — the exact output format the agent must produce
4. **Examples pointer** — point to `examples/bad-*` and `examples/good-*` for
   reference cases

Hard rules:

- Use **progressive disclosure**: keep `SKILL.md` under ~80 lines, push detail
  into `prompts/`.
- Each `prompts/<file>.md` covers one scenario. Multiple scenarios in one file
  make selective loading impossible.
- Use the exact no-finding sentence `未发现明确高风险问题。` for any reviewer
  skill that uses the same severity ladder.

## `prompts/` Conventions

- File names describe a single scenario, e.g. `concurrency-reviewer.md`,
  `error-reviewer.md`, `codegraph.md`.
- Each file starts with a one-line H1 naming the scope
  (e.g. `# Java Concurrency Reviewer Prompt`).
- Each file's `Required Checks` / `Fallback` section is the
  authoritative checklist for that scenario.
- If a prompt depends on an external tool that may be missing
  (e.g. CodeGraph), include an explicit **fallback contract**:
  - Trigger condition (how to detect unavailability)
  - Fallback order
  - The exact fallback line the agent must emit
    (e.g. `CodeGraph unavailable; context was gathered by rg/file inspection.`)
  - Stop-loss rules (when to stop trying)

## `examples/` Conventions

Each `bad-<file>` should have a matching `good-<file>` that shows the
minimum fix for every Critical/High finding. The pairing is the
primary teaching asset — a bad example without its good counterpart
is incomplete.

- `examples/bad-*.{java,tsx,ts,go,...}` — annotated with the issue
  category it demonstrates
- `examples/good-*.{java,tsx,ts,go,...}` — minimal fix; top-of-file
  comment lists the issue IDs it addresses
- `examples/review-output.md` — full reviewer output for the bad
  example, formatted exactly as a real agent should produce
- `examples/pr-diff-example.diff` — minimal PR-shaped diff that
  reproduces the bad code; optional but helpful for training
- `examples/workflow-note.md` / `examples/knowledge-note.md` — for
  workflow skills, a sample of the artifact the skill should produce

## Cross-Skill References

A skill may reference other skills by name (e.g.
`java-code-reviewer for Java backend changes`). The consumer must
install referenced skills separately; `npx skills` does not transitively
install dependencies. Document any required peers in the skill body and
in this repository's `README.md` under "Cross-Skill Dependencies".

## Cross-Reference to Other Skills

When a new skill is part of an existing workflow, add it to:

- The root `README.md` "Included Skills" list
- Any other skill that references it by name in its body
- Any "Cross-Skill Dependencies" section that lists install commands

## Proposing a Skill

1. Create the directory and `SKILL.md` first; get the frontmatter and
   "Required Loading" right before adding prompts.
2. Add at least one `examples/bad-<file>` + `examples/good-<file>` pair
   that demonstrates the skill's primary use case.
3. Add `examples/review-output.md` (or equivalent) showing the expected
   output for the bad example.
4. Update the root `README.md` skill list and any cross-skill dependency
   blocks that reference the new skill.
5. Open a PR. The `npx skills` consumer pulls from `main` directly, so
   the next install picks up new skills without version coordination.

## Quality Bar

A skill is ready to merge when:

- `SKILL.md` frontmatter is valid (name matches directory, description ≥ 40 chars)
- `SKILL.md` body is under ~80 lines and references prompts by relative path
- Each `prompts/*.md` covers one scenario and is the only authority for that scenario's checklist
- Every `examples/bad-*` has a matching `examples/good-*`
- `examples/review-output.md` matches the contract declared in `SKILL.md`
- Cross-skill references resolve to skills that exist in this repository
- New skills appear in root `README.md` and in any dependent skill's docs

## License

By contributing, you agree your contributions are licensed under the
repository's MIT license.
