# Skills Registry

This repository is a shadcn-compatible source registry for reusable AI skills. It is designed to hold all future skills in one public GitHub registry.

## Install Items

List available skills:

```sh
pnpm dlx shadcn@latest list liyown/skills-registry
```

View an item before installing:

```sh
pnpm dlx shadcn@latest view liyown/skills-registry/java-code-reviewer
```

Install the Java reviewer skill into the current project:

```sh
pnpm dlx shadcn@latest add liyown/skills-registry/java-code-reviewer
```

The default target is:

```text
.skills/java-code-reviewer/
```

## Registry Layout

```text
.
├── registry.json
├── skills/
│   └── java-code-reviewer/
│       ├── registry.json
│       ├── SKILL.md
│       ├── manifest.json
│       ├── agents/
│       ├── prompts/
│       └── examples/
├── scripts/
└── .github/workflows/
```

The root `registry.json` contains registry metadata and composes skill entries with `include`. Each skill owns its own nested `registry.json`, keeping future additions small and reviewable.

## Add A Skill

1. Create `skills/<skill-name>/`.
2. Add the skill files under that directory.
3. Add `skills/<skill-name>/registry.json` with a single `registry:item`.
4. Add the nested registry path to the root `registry.json` `include` array.
5. Run validation and build.

Use `registry:file` entries with explicit `target` paths. The default convention is:

```text
~/.skills/<skill-name>/<file>
```

In shadcn registry targets, `~` resolves to the consumer project's root.

## Build

Validate local registry structure:

```sh
./scripts/validate.sh
```

Build distributable artifacts:

```sh
./scripts/build.sh
```

Artifacts are written to `dist/`:

- `registry.json`: flattened registry payload with included items resolved
- `items/*.json`: generated registry item payloads
- `skills-registry-<version>.tar.gz`
- `skills-registry-<version>.zip`, when `zip` is available
- `SHA256SUMS`

## GitHub Registry Notes

GitHub registry installation requires a public GitHub repository with `registry.json` at the repository root. Private registries require a separate namespace and authentication setup.

## Included Skills

- `java-code-reviewer`: strict Java backend production-risk code review

## License

MIT
