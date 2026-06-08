# Changelog

All notable changes to this skills registry are documented here.
Versions follow [Semantic Versioning](https://semver.org/). The
source of truth is the git tag; this file mirrors the release
history for offline review.

## Unreleased

## 0.3.1 (2026-06-08)

Tag: `v0.3.1`. Commits since v0.3.0: 4.

### Added

- `scripts/release.sh` — tag-driven release flow. Reads `git describe`,
  bumps the patch component, runs `./scripts/validate.sh`, creates
  an annotated tag, and pushes both the branch and the tag to
  origin. Supports `--dry-run` (preview without mutating) and
  `--bump X.Y.Z` (override the auto-bumped version).
- `docs:` Reviewer Coverage Matrix footer links to the per-prompt
  `> See also:` lines so consumers can navigate the matrix index
  and the in-prompt cross-references from either side.
- `docs:` README "Latest Release" section now points at the current
  tag and includes a `git log` hint for the full diff.
- `docs/releases/v0.3.1.md` — in-repo mirror of the GitHub release
  notes (so reviewers do not need GitHub API access to inspect the
  release).

### Installation

```sh
npx skills add liyown/skills-registry#v0.3.1 --skill java-code-reviewer
```

### Verification at tag time

- `./scripts/validate.sh` exit=0:
  - `smoke check passed`
  - `examples check passed`
  - `validation passed`
- `./scripts/release.sh --dry-run` prints the would-be actions
  without creating a tag; verified both default patch bump and
  explicit `--bump 0.4.0`.

## 0.3.0 (2026-06-08)

Tag: `v0.3.0`. Released: <https://github.com/liyown/skills-registry/releases/tag/v0.3.0>.

### Added

- Drop the shadcn-style registry infrastructure (`registry.json`,
  per-skill `manifest.json` / `registry.json` / `agents/openai.yaml`,
  `scripts/build.sh` / `scripts/validate.sh` /
  `scripts/validate-registry.mjs`, `docs/adding-skills.md`,
  `.github/workflows/build.yml`, `package.json`) in favour of a
  pure `npx skills` collection.
- `go-code-reviewer` — evidence-driven Go backend review (7
  prompts, 12 examples).
- `python-code-reviewer` — Python backend review (6 prompts, 11
  examples).
- `node-code-reviewer` — Node.js backend review (6 prompts, 11
  examples).
- `scripts/smoke.sh`, `scripts/check-examples.sh`,
  `scripts/validate.sh` — offline structural assertions (no
  external toolchains).
- `CONTRIBUTING.md` — frontmatter schema, body conventions, prompt
  /example naming, bad/good pairing rules, fallback contracts,
  quality bar.
- `docs/CHANGELOG.md` — this file.
- Per-prompt `> See also:` cross-references in all 33 prompts
  across 7 skills.

### Changed

- All skill `SKILL.md` / `README.md` / `prompts/*.md` / `examples/`
  bodies unified to English (was previously mixed Chinese/English).
  Three contract phrases retained in their original language:
  `未发现明确高风险问题。`, `需要结合上下文确认`,
  `CodeGraph unavailable; context was gathered by rg/file inspection.`
- `goal-driven-development` now lists `go-code-reviewer`,
  `python-code-reviewer`, `node-code-reviewer` alongside the
  existing `java-code-reviewer` and `react-code-reviewer`.
- Root `README.md` rewritten for the `npx skills` install model
  with a Cross-Skill Dependencies section and a Reviewer Coverage
  Matrix.

### Installation

```sh
npx skills add liyown/skills-registry#v0.3.0 --skill java-code-reviewer
```

## 0.2.0

Initial shadcn-compatible registry release. Four skills:
`java-code-reviewer`, `react-code-reviewer`,
`goal-driven-development`, `project-knowledge-capture`. Single
`SKILL.md` entrypoint per skill, manifest-driven file lists,
nested `registry.json` per skill. Released prior to the move to
`npx skills`.
