# Adding Skills

Use this checklist when adding a new skill to the registry.

## Directory

Create a directory under `skills/`:

```text
skills/<skill-name>/
```

Recommended files:

```text
skills/<skill-name>/
├── registry.json
├── skill.md
├── SKILL.md
├── manifest.json
├── prompts/
├── examples/
└── agents/
```

`skill.md` is the platform-neutral entrypoint. `SKILL.md` is kept only when a runtime needs that exact filename.

## Nested Registry

Each skill should define one `registry:item` in `skills/<skill-name>/registry.json`.

Use explicit targets:

```json
{
  "path": "skill.md",
  "type": "registry:file",
  "target": "~/.skills/<skill-name>/skill.md"
}
```

## Root Include

Add the nested registry to the root `registry.json`:

```json
{
  "include": [
    "skills/<skill-name>/registry.json"
  ]
}
```

Keep item names unique across the full registry.

## Validate

Run:

```sh
./scripts/validate.sh
./scripts/build.sh
```

Before publishing, also run the official shadcn validation command when network access is available:

```sh
npx shadcn@latest registry validate
```
