# Release Index

Cross-reference for every release of this skills registry. The git
tag is the source of truth; this index is a human-readable map to
the GitHub release page, the in-repo mirror, and the cumulative
changelog.

## Releases (newest first)

| Tag | Date | Commits | GitHub Release | In-repo mirror |
| --- | --- | --- | --- | --- |
| `v0.3.7` | 2026-06-08 | 1 since v0.3.6 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.7> | [v0.3.7.md](v0.3.7.md) |
| `v0.3.6` | 2026-06-08 | 3 since v0.3.5 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.6> | [v0.3.6.md](v0.3.6.md) |
| `v0.3.5` | 2026-06-08 | 2 since v0.3.4 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.5> | [v0.3.5.md](v0.3.5.md) |
| `v0.3.4` | 2026-06-08 | 4 since v0.3.3 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.4> | [v0.3.4.md](v0.3.4.md) |
| `v0.3.3` | 2026-06-08 | 6 since v0.3.2 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.3> | [v0.3.3.md](v0.3.3.md) |
| `v0.3.2` | 2026-06-08 | 8 since v0.3.1 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.2> | [v0.3.2.md](v0.3.2.md) |
| `v0.3.1` | 2026-06-08 | 4 since v0.3.0 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.1> | [v0.3.1.md](v0.3.1.md) |
| `v0.3.0` | 2026-06-08 | 11 since v0.2.0 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.0> | (no mirror — pre-script era) |
| `v0.2.0` | 2026-06-05 | 1 since v0.1.1 | <https://github.com/liyown/skills-registry/releases/tag/v0.2.0> | (no mirror) |
| `v0.1.1` | 2026-06-05 | 2 since v0.1.0 | <https://github.com/liyown/skills-registry/releases/tag/v0.1.1> | (no mirror) |
| `v0.1.0` | 2026-06-05 | 2 (initial) | <https://github.com/liyown/skills-registry/releases/tag/v0.1.0> | (no mirror) |

## How a release flows

The release process is implemented in [`scripts/release.sh`](../../scripts/release.sh):

1. `git describe --tags` reads the current annotated tag
2. patch version is bumped (or `--bump X.Y.Z` overrides)
3. `./scripts/validate.sh` runs (smoke + examples + structural)
4. `--dry-run` shows the would-be actions without mutating
5. `--yes` skips the interactive prompt
6. `--notes-from <file>` validates the release notes file and
   surfaces the exact `gh release create --notes-file <file>`
   command the caller should run after the tag is pushed
7. `--no-publish` creates the tag locally without pushing

`.github/workflows/release-readiness.yml` runs the same `validate.sh`
+ `release.sh --dry-run` on every push to `main`, so a regression
in the release flow cannot pass CI unnoticed.

## Where to find what

- Cumulative release history: [docs/CHANGELOG.md](../CHANGELOG.md)
- Single release's in-repo notes: `docs/releases/vX.Y.Z.md`
- Single release's GitHub page: link in the table above
- Single release's full diff: `git log vX.Y.Z-1..vX.Y.Z`
