# Release Index

Cross-reference for every release of this skills registry. The git
tag is the source of truth; this index is a human-readable map to
the GitHub release page and the cumulative changelog.

## Releases (newest first)

| Tag | Date | Commits | GitHub Release |
| --- | --- | --- | --- |
| `v0.3.9` | 2026-06-08 | 1 since v0.3.8 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.9> |
| `v0.3.8` | 2026-06-08 | 2 since v0.3.7 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.8> |
| `v0.3.7` | 2026-06-08 | 1 since v0.3.6 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.7> |
| `v0.3.6` | 2026-06-08 | 3 since v0.3.5 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.6> |
| `v0.3.5` | 2026-06-08 | 2 since v0.3.4 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.5> |
| `v0.3.4` | 2026-06-08 | 4 since v0.3.3 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.4> |
| `v0.3.3` | 2026-06-08 | 6 since v0.3.2 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.3> |
| `v0.3.2` | 2026-06-08 | 8 since v0.3.1 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.2> |
| `v0.3.1` | 2026-06-08 | 4 since v0.3.0 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.1> |
| `v0.3.0` | 2026-06-08 | 11 since v0.2.0 | <https://github.com/liyown/skills-registry/releases/tag/v0.3.0> |
| `v0.2.0` | 2026-06-05 | 1 since v0.1.1 | <https://github.com/liyown/skills-registry/releases/tag/v0.2.0> |
| `v0.1.1` | 2026-06-05 | 2 since v0.1.0 | <https://github.com/liyown/skills-registry/releases/tag/v0.1.1> |
| `v0.1.0` | 2026-06-05 | 2 (initial) | <https://github.com/liyown/skills-registry/releases/tag/v0.1.0> |

The release flow lives in [`scripts/release.sh`](../../scripts/release.sh);
see its header for flags and behavior. The CI gate is
[`.github/workflows/release-readiness.yml`](../../.github/workflows/release-readiness.yml).

## Where to find what

- Cumulative release history: [docs/CHANGELOG.md](../CHANGELOG.md)
- Single release's GitHub page: link in the table above
- Single release's full diff: `git log vX.Y.Z-1..vX.Y.Z`
