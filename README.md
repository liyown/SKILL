# Skills Registry

A collection of reusable AI skills installed with the [skills.sh](https://skills.sh)
CLI (`npx skills`). Each skill lives in its own directory under `skills/` and
is discoverable by name.

## Latest Release

**v0.3.0** (2026-06-08). Pin to a specific tag with `#v0.3.0`:

```sh
npx skills add liyown/skills-registry#v0.3.0 --skill java-code-reviewer
```

See [docs/CHANGELOG.md](./docs/CHANGELOG.md) for the full release history
and per-version highlights. 11 commits since v0.2.0; see
`git log v0.2.0..v0.3.0` for the full diff.

## Install

```sh
# install one or more skills
npx skills add liyown/skills-registry --skill java-code-reviewer
npx skills add liyown/skills-registry --skill react-code-reviewer
npx skills add liyown/skills-registry --skill go-code-reviewer
npx skills add liyown/skills-registry --skill python-code-reviewer
npx skills add liyown/skills-registry --skill node-code-reviewer
npx skills add liyown/skills-registry --skill goal-driven-development
npx skills add liyown/skills-registry --skill project-knowledge-capture

# install everything
npx skills add liyown/skills-registry
```

`npx skills` reads the `SKILL.md` frontmatter in each subdirectory and copies
the whole skill folder into the consumer's local skills directory
(`~/.claude/skills/<name>/` for Claude Code, etc.).

## Cross-Skill Dependencies

`npx skills` does not auto-install dependencies referenced inside a skill's
body. When a skill says "invoke `<other-skill>` for X", the consumer must
install that other skill separately. Concrete cases in this collection:

- `goal-driven-development` references `java-code-reviewer`,
  `react-code-reviewer`, `go-code-reviewer`, `python-code-reviewer`,
  `node-code-reviewer`, and `project-knowledge-capture` as runtime
  helpers. Install all six alongside it:

  ```sh
  npx skills add liyown/skills-registry \
    --skill goal-driven-development \
    --skill java-code-reviewer \
    --skill react-code-reviewer \
    --skill go-code-reviewer \
    --skill python-code-reviewer \
    --skill node-code-reviewer \
    --skill project-knowledge-capture
  ```

  Install can be repeated; existing skills are updated in place.

## Included Skills

- `java-code-reviewer` — evidence-driven Java backend production-risk review.
- `react-code-reviewer` — React / TypeScript / Next.js frontend production-risk review.
- `go-code-reviewer` — Go backend production-risk review (goroutines, context, errors, sqlx, gRPC).
- `python-code-reviewer` — Python backend production-risk review (asyncio, error handling, SQLAlchemy/Django, security).
- `node-code-reviewer` — Node.js backend production-risk review (async, error handling, Prisma, Express/Fastify, security).
- `goal-driven-development` — CodeGraph-assisted implementation workflow for existing specs/goals.
- `project-knowledge-capture` — durable project knowledge capture into `docs/knowledge/`.

## Reviewer Coverage Matrix

Each reviewer skill loads `prompts/reviewer.md` (core protocol) and one or
more scenario-specific prompts. The matrix shows which scenarios each
reviewer covers; cell entries are the scenario prompt file names.

| Scenario | java | react | go | python | node |
| --- | --- | --- | --- | --- | --- |
| Framework / runtime | `spring-reviewer.md` | `nextjs-reviewer.md` | `rpc-reviewer.md` | `web-reviewer.md` | `http-reviewer.md` |
| Concurrency / async | `concurrency-reviewer.md`, `reactor-reviewer.md` | — | `concurrency-reviewer.md` | `async-reviewer.md` | `async-reviewer.md` |
| Error handling | — | — | `error-reviewer.md` | `error-reviewer.md` | `error-reviewer.md` |
| Database / ORM | `mybatis-reviewer.md` | — | `sql-reviewer.md` | `sql-reviewer.md` | `sql-reviewer.md` |
| Caching / messaging | `redis-kafka-reviewer.md` | — | — | — | — |
| Security | `security-reviewer.md` | `security-reviewer.md` | `security-reviewer.md` | `security-reviewer.md` | `security-reviewer.md` |
| Performance | — | `performance-reviewer.md` | — | — | — |

A `—` cell means the reviewer has no dedicated scenario prompt for that
category. Add a `<scenario>-reviewer.md` under the relevant `prompts/`
folder and reference it from `SKILL.md` to close a gap.

> Cell entries are file names inside the row's `prompts/` directory; some
> scenario names (`security-reviewer`, `sql-reviewer`, `error-reviewer`,
> `concurrency-reviewer`) exist in multiple skills, each maintained for
> its target language.

## Layout

```text
.
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── skills/
    ├── java-code-reviewer/
    ├── react-code-reviewer/
    ├── go-code-reviewer/
    ├── python-code-reviewer/
    ├── node-code-reviewer/
    ├── goal-driven-development/
    └── project-knowledge-capture/
```

Each skill folder contains:

```text
skills/<name>/
├── SKILL.md            # required: frontmatter (name, description) + body
├── README.md           # human-readable description
├── prompts/            # scenario-specific prompt fragments (loaded on demand)
└── examples/           # bad/good code samples and review outputs
```

## Authoring A Skill

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contract
(frontmatter schema, `SKILL.md` body conventions, prompts/examples
naming, bad/good pairing rules, quality bar).

Quick version:

1. Create `skills/<name>/` with a `SKILL.md` whose frontmatter
   `name` matches the directory and `description` is ≥ 40 chars.
2. Add `prompts/` (one scenario per file, progressive disclosure) and
   `examples/` (every `bad-*` paired with a `good-*`).
3. Update the "Included Skills" list above and any cross-skill
   dependency blocks that reference the new skill.
4. Open a PR. `npx skills` consumers pull from `main` directly, so the
   next install picks up new skills without version coordination.

## Local Checks

```sh
./scripts/validate.sh
```

Runs two structural assertions without external toolchains (no `go`, no
`javac`, no `tsc` required):

- **`scripts/smoke.sh`** — every `skills/<name>/SKILL.md` has valid
  frontmatter, a matching directory name, and resolves every
  `prompts/` and `examples/` path it references.
- **`scripts/check-examples.sh`** — every reviewer has a `bad-*` /
  `good-*` pair, every `good-*` is non-trivial and self-identifies,
  and no stray filenames slipped into `examples/`.

Use as a local pre-merge check or as a CI step.

## License

MIT
