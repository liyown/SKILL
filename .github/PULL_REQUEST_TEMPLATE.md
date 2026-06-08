## What does this PR change?

One sentence: which file(s) and what for.

## Type of change

- [ ] New skill under `skills/<name>/`
- [ ] New scenario prompt under an existing `skills/<name>/prompts/`
- [ ] New `bad-` / `good-` example pair (or `pr-diff-example.diff`)
- [ ] Documentation (root `README.md`, `CONTRIBUTING.md`,
      `docs/CHANGELOG.md`, `docs/releases/`)
- [ ] CI / script (`scripts/`, `.github/workflows/`)
- [ ] Bug fix (link issue)

## Self-check

- [ ] I ran `./scripts/validate.sh` locally and it exits 0.
- [ ] I added or updated examples: every `bad-*` has a matching
      `good-*` and every `good-*` opens with a `Fix N:` annotation
      block.
- [ ] If this adds a new skill, I updated the root `README.md`
      "Included Skills" and "Skills at a Glance" sections.
- [ ] If this closes a Coverage Matrix gap, I added a row.
- [ ] If this changes the release flow, I ran
      `scripts/release.sh --dry-run --notes-from <file>` and
      confirmed the preview is correct.
- [ ] If this is a documentation-only change, no skill files
      were touched.

## Cross-references

- Related issue: #...
- Related skill or prompt: `skills/<name>/...`
- Related release notes section: `docs/releases/vX.Y.Z.md#...`

## Pre-merge CI

The `release-readiness` workflow will run on this PR and will
fail if `./scripts/validate.sh` exits non-zero or if
`./scripts/release.sh --dry-run` fails. Both are part of the
quality bar in [CONTRIBUTING.md](../../CONTRIBUTING.md).
