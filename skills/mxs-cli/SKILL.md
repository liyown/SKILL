---
name: mxs-cli
description: Use when working with `mxs`, `@mx-space/cli`, or a deployed mx-core instance from the terminal. Covers authentication, profiles, safe writes, content CRUD, comments, snippets, AI tasks, preview, and output modes for humans, scripts, and AI agents.
---

# MXS CLI

Use this skill when the task involves managing an mx-core site through `mxs`.

This is an operations CLI, not the old frontend SDK. Prefer it for terminal automation, admin workflows, and AI-agent-safe read/write operations.

## Prerequisites

Before using the CLI:

1. Check that `mxs` is installed.
2. Assume Node.js 22+ is required.
3. If no profile exists yet, run `mxs auth login`.

Minimal checks:

```bash
command -v mxs
mxs auth status
```

## Core model

Think in four layers:

- `auth`: who you are
- `profile`: which environment you are talking to
- content verbs: `post`, `note`, `page`, `project`, `comment`, `snippet`
- output mode: human, machine, or round-trip editing

The most important operational rule is: profile and output mode matter as much as the subcommand.

## Required workflow

### 1. Resolve identity and target first

Before any write:

1. run `mxs auth whoami` or `mxs auth status`
2. inspect the active profile if needed: `mxs profile ls`
3. if the target is production, use an explicit per-invocation signal such as `--profile prod`

Do not rely on the inherited `current` profile for production writes.

### 2. Pick the right output mode

Use:

- `--output llm` for AI-agent reading
- `--output readable` for human terminal reading
- `--json` for scripts and structured automation
- `--output xml` for editable round trips

Examples:

```bash
mxs post list --output llm
mxs post get my-slug --output readable
mxs post get my-slug --output xml > /tmp/post.xml
mxs --json comment unread
```

### 3. Prefer read before write

For update tasks:

1. fetch the current object
2. choose either targeted flags or an editable file round trip
3. write back explicitly
4. if applicable, publish separately

Round-trip pattern:

```bash
mxs post get my-slug --output xml > /tmp/post.xml
# edit /tmp/post.xml
mxs post update my-slug --file /tmp/post.xml --open
mxs post publish my-slug
```

## Profiles and safety

Profiles live under `~/.config/mxs/profiles/<name>/` and bundle both API URL and credentials.

Important rules:

- `--profile <name>` overrides everything
- `MXS_PROFILE` overrides the active pointer
- `~/.config/mxs/current` is only the fallback
- production-marked profiles block inherited silent writes

If a write fails with `profile.write_requires_explicit`, retry with explicit intent:

```bash
mxs --profile prod post publish my-slug
```

Useful commands:

```bash
mxs profile ls
mxs profile show
mxs profile use dev
mxs profile mark prod --production
```

## High-frequency workflows

### Posts

Read:

```bash
mxs post list --output llm
mxs post get my-slug --output readable
```

Create:

```bash
mxs post create \
  --title "标题" \
  --slug "my-slug" \
  --content file=body.md \
  --format markdown \
  --state draft
```

Patch selected fields:

```bash
mxs post update my-slug --summary "摘要" --tags "cli,ai"
```

Publish:

```bash
mxs post publish my-slug
```

### Notes

```bash
mxs note list --output llm
mxs note create --title "无题" --content "hello" --state draft
mxs note update my-note --content file=note.md --format markdown
```

### Pages

```bash
mxs page list
mxs page get about --output readable
mxs page update about --file about.xml
```

### Comments

Use this for moderation queues:

```bash
mxs comment unread
mxs comment get 141088044533944320
mxs comment reply 141088044533944320 --text "thanks for reading"
mxs comment approve 141088044533944320
mxs comment reject 141088044533944320
```

For destructive or bulk operations in non-TTY contexts, expect `--force`.

### Projects

```bash
mxs project list
mxs project view my-project --output llm
mxs project create --name my-project --description "desc"
```

### Snippets

Snippets accept either Snowflake ids or `reference/name`.

```bash
mxs snippet list --grouped
mxs snippet get web/theme
mxs snippet create --name theme --reference web --type json --file theme.json
mxs snippet edit web/theme
```

### AI tasks

These commands enqueue work and usually poll until completion unless `--no-wait` is used.

```bash
mxs ai summary regen my-post --to en --to ja
mxs ai translate run my-post --to en
mxs ai insights refresh my-post
```

## Content input rules

For body-like fields, `--content` supports:

- inline literal
- `file=<path>`
- `-` or `stdin`

Examples:

```bash
mxs post create --content "inline text"
mxs post create --content file=body.md
cat body.md | mxs post create --content -
```

For structured fields such as `--meta` or `--images`, use either:

- inline JSON
- `file=<path>`

## LiteXML round trips

Use `--output xml` or `--file <path>` when you need stable editable documents.

Supported document envelopes:

- `<mxpost>`
- `<mxnote>`

Page editing currently reuses the post-shaped envelope.

Use XML when:

- an AI or human needs to edit title, metadata, and body together
- you want deterministic round-trip content updates
- you need a format with lower ambiguity than ad hoc flag patching

## Preview

`mxs preview` renders LiteXML locally and does not talk to mx-core.

```bash
mxs preview ./post.xml
mxs preview ./post.xml --theme dark
mxs preview ./post.xml --save out.html
mxs preview ./post.xml --print
```

Use this before publishing if the task is content review rather than server mutation.

## Agent usage guidance

For AI-agent tasks, prefer:

1. `--output llm` for reading
2. `--json` for machine-checked branching
3. XML envelopes for edits
4. explicit `--profile` on production-like writes

Recommended pattern:

```bash
mxs --profile prod post get my-slug --output llm
mxs --profile prod post get my-slug --output xml > /tmp/post.xml
mxs --profile prod post update my-slug --file /tmp/post.xml
```

## Troubleshooting

- `API URL is not configured`: run `mxs auth login` or pass `--api-url`
- `profile.none_active`: activate or create a profile first
- `profile.write_requires_explicit`: add `--profile <name>` or `MXS_PROFILE=<name>`
- `EDITOR is not set`: export `EDITOR=vim` or another editor
- API key auth: use `--api-key` or `MXS_API_KEY`, not Bearer token auth

## v0.3 points worth remembering

- v0.3 is an Effect-TS rewrite, but the user-facing CLI surface is intended to stay stable
- there is no first-run onboarding prompt anymore
- the public JavaScript API surface is intentionally minimal
- the CLI binary is the supported integration surface
