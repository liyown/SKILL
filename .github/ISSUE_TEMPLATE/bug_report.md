---
name: Bug report
about: Something in a skill, prompt, example, or script is wrong
title: ""
labels: bug
assignees: ""
---

## What is broken?

State the smallest piece that does not work as documented. Quote
the file path and line if you can. Example:

> `skills/java-code-reviewer/prompts/reviewer.md` says the
> no-finding sentence is `...`, but the SKILL.md uses
> `...`.

## How to reproduce

If the bug is in a script (e.g. `scripts/release.sh`):

```sh
./scripts/release.sh --bump 99.0.0 --yes
```

If the bug is in a prompt or example, paste the snippet and the
agent output that does not match.

## What I expected

One sentence: what the correct behaviour would look like.

## What I saw

Actual output, error message, or surprising result. Paste verbatim
where possible.

## Environment

- commit / tag: `git describe --tags`
- consumer: Claude Code / Cursor / Codex / other
- skill(s) involved: `java-code-reviewer` / `react-code-reviewer` / etc.

## Pre-flight

- [ ] I ran `./scripts/validate.sh` and it passed.
- [ ] I read [CONTRIBUTING.md](../../CONTRIBUTING.md) and my issue
      is not already covered.
- [ ] I checked [docs/releases/INDEX.md](../../docs/releases/INDEX.md)
      for the latest released version.
