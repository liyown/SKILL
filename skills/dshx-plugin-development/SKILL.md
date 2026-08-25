---
name: dshx-plugin-development
description: Build, modify, diagnose, or review out-of-tree DeepSeek Harness plugins authored with DSHX. Use for @becomeopc/dshx, create-dshx, dshx.config.ts, Host or Client contributions, Prompt, Settings, typed API, Slots, and Conversation Components. Do not use for DSH core development or DSHX Hub catalog operations.
---

# DSHX Plugin Development

Develop the requested plugin against the installed DSH contract while keeping DSHX build-time and runtime-thin. Do not create parallel registries, lifecycle managers, transports, persistence, or assembly behavior that official DSH and Cordis already own.

## Start with project evidence

Read [references/development-workflow.md](references/development-workflow.md) before changing a project. Determine whether this is a new plugin, an existing DSHX plugin, or a DSHX framework repository change. Inspect the repository state, package manifest, `dshx.config.ts`, Host and Client entries, installed versions, and existing tests before choosing an API.

Use `pnpm`. Preserve unrelated work and do not publish, deploy, mutate a DSH Profile beyond the requested development workflow, or change public compatibility claims without explicit authorization and verification.

## Select only the required surface

Read [references/api-map.md](references/api-map.md) for the contribution being changed. Follow the linked API reference for its current signature instead of reconstructing an API from memory.

Prefer these source-of-truth layers, in order:

1. installed package types and the project lockfile;
2. `dshx check` compatibility and provider-edge diagnostics;
3. live `dshx inspect` results for provider-owned Slots, Services, or Events;
4. the published DSHX API reference;
5. adjacent DSH source only for investigation, never as proof of published compatibility.

## Preserve runtime ownership

- Put Node and Cordis behavior in the Host, React behavior in the Client, and only portable contracts in shared modules.
- Let official services own scope, order semantics, shadowing, assembly, replay, persistence, transport, HMR, and disposal.
- Use `ctx.effect()` or the official service lifecycle for resources started from `setup(ctx)`.
- Treat Conversation Components as experimental and use only official `SessionEventMap` event keys.
- Do not add a duplicate `ClientDefinition.settings`; retained `useSettings()` declares that capability.
- Prefer retained `useApi()` or `useQuery()` over duplicate eager Client API declarations.

## Finish with observable verification

Run checks proportional to the change and report exactly what ran. At minimum, typecheck or `pnpm check` and build the plugin. For runtime behavior, use the installed DSH version and verify the relevant registration, interaction, restart, or HMR path; do not present simulated tests as real-runtime proof.
