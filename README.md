# Skills Registry

This repository is a shadcn-compatible source registry for reusable AI skills. It remains a general skill registry, not a single-flow repository.

## Install Items

List available skills:

```sh
pnpm dlx shadcn@latest list liyown/skills-registry
```

View an item before installing:

```sh
pnpm dlx shadcn@latest view liyown/skills-registry/java-code-reviewer
pnpm dlx shadcn@latest view liyown/skills-registry/react-code-reviewer
pnpm dlx shadcn@latest view liyown/skills-registry/goal-driven-development
pnpm dlx shadcn@latest view liyown/skills-registry/project-knowledge-capture
```

Install the goal-driven development workflow and its dependencies:

```sh
pnpm dlx shadcn@latest add liyown/skills-registry/goal-driven-development
```

Install individual skills:

```sh
pnpm dlx shadcn@latest add liyown/skills-registry/java-code-reviewer
pnpm dlx shadcn@latest add liyown/skills-registry/react-code-reviewer
pnpm dlx shadcn@latest add liyown/skills-registry/project-knowledge-capture
```

Pin to the v0.2.0 registry release:

```sh
pnpm dlx shadcn@latest add liyown/skills-registry/goal-driven-development#v0.2.0
```

Skills install under:

```text
.skills/<skill-name>/
```

## Included Skills

- `java-code-reviewer`: evidence-driven Java backend production-risk review.
- `react-code-reviewer`: React / TypeScript / Next.js frontend production-risk review.
- `goal-driven-development`: CodeGraph-assisted implementation workflow for existing specs/goals.
- `project-knowledge-capture`: durable project knowledge capture into `docs/knowledge/`.

## Registry Layout

```text
.
├── registry.json
├── skills/
│   ├── java-code-reviewer/
│   ├── react-code-reviewer/
│   ├── goal-driven-development/
│   └── project-knowledge-capture/
├── scripts/
└── .github/workflows/
```

The root `registry.json` composes nested skill registries with `include`. Each skill owns its own `registry.json`, keeping additions small and reviewable.

## Add A Skill

1. Create `skills/<skill-name>/`.
2. Add `SKILL.md`, `manifest.json`, prompts, examples, and optional agent metadata.
3. Add `skills/<skill-name>/registry.json` with a single `registry:item`.
4. Add the nested registry path to root `registry.json`.
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

## License

MIT
