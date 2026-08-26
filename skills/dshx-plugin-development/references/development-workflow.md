# DSHX development workflow

## 1. Collect project evidence

Start read-only. Record the worktree state and inspect the nearest package boundary:

```text
package.json
pnpm-lock.yaml
dshx.config.ts
cordis.patch.yml
src/host.ts
src/client.tsx
src/settings.ts
src/api/**/*.ts
tests/**/*
```

Confirm the project through evidence, not its directory name:

- a DSHX plugin normally has `@becomeopc/dshx`, `dshx.config.ts`, a DSH bundle patch, and Host or Client entries;
- `peerDependencies.@deepseek-ai/dsh` is the public runtime claim;
- one concrete `devDependencies.@deepseek-ai/dsh` is the local build/test runtime;
- `dsh.client.inject` lists Client provider packages that must load before the bundle;
- `dsh.client.external` lists official Client runtime modules supplied by DSH;
- the installed DSHX version and lockfile are authoritative for available APIs.

Use pnpm in the DSHX monorepo and for commands shown by this workflow. In an existing external plugin, respect explicit repository package-manager evidence; do not introduce a second lockfile. Preserve user changes and do not rewrite public compatibility ranges without runtime evidence.

## 2. Create or baseline

For a new Preview plugin, create an empty target through the official initializer:

```bash
pnpm create dshx@preview my-plugin --template starter --style css-modules
cd my-plugin
pnpm check
pnpm build
```

Use `showcase` only when its Settings/API/Prompt example helps the requested behavior. Choose `tailwind` only when requested; its generated setup is prefixed and omits Preflight. The initializer refuses an existing target and pins its matching DSHX release.

For an existing plugin, run the offline baseline before broad edits:

```bash
pnpm check
# or, without a package script:
pnpm exec dshx check --json
```

Plain check needs no Profile. It covers config, manifest, provider edges, compatibility, migrations, TypeScript, and artifact declarations. Inspect `pnpm exec dshx check --fix --dry-run` before any requested metadata repair; do not use `--fix` for source migrations.

## 3. Inspect and scaffold from official evidence

Runtime Inspect is read-only and requires a linked/running Composition:

```bash
pnpm exec dshx check --runtime
pnpm exec dshx inspect slots --json
pnpm exec dshx inspect tools --json
pnpm exec dshx inspect services --json
pnpm exec dshx inspect events --json
```

Use the returned provider-owned Slot, Service, or Event names. If an Inspect provider is unavailable, use installed official types and report the boundary; do not invent a catalog.

Transactional `add` commands can scaffold supported source contributions:

```bash
pnpm exec dshx add ui --slot <slot> --dry-run
pnpm exec dshx add tool --name <name> --dry-run
pnpm exec dshx add command --name <name> --dry-run
pnpm exec dshx add hook --event <event> --dry-run
```

Review the diff, then rerun without `--dry-run`. `add` does not install packages, mutate a Profile, or start DSH. There are no `add api`, `settings`, `prompt`, or `conversation` commands; author those contracts directly from their public API.

## 4. Implement at the owned boundary

- Shared Settings/API files contain portable contracts only.
- Host owns handlers, base/validate/setup, secrets, authorization, filesystem/process access, idempotency, and cancellation propagation.
- Client owns React rendering and Hooks. Import the official Slot provider's Client augmentation before `defineSlot()`.
- `defineLocale()` owns plugin dictionaries; add its definition to `defineClient.locales` and the consuming Slot's `locale`, and keep the official Locale provider in `dsh.client.inject`.
- Register every opaque contribution once. Do not inspect/copy opaque contributions or mirror an official registry.
- Add Vite transforms only through bounded `host.vite.plugins` or `client.vite.plugins`; do not create a competing Vite root/config/output policy.
- A Conversation API response is not durable Session history. Persisted results must return through official events and replay.

When changing DSHX itself, update public types, runtime/compiler behavior, static diagnostics, tests, Starter output when the contract changes, documentation in both languages, compatibility capabilities where relevant, and a Changeset.

## 5. Run the real development loop

```bash
pnpm dev
# select an available DSH Web port when needed
pnpm dev -- --port 0
```

Generated projects use `dshx dev --open`. Dev performs initial Host/Client builds, links through the official DSH Profile workflow, then starts DSH. Client rebuilds use official Client HMR without restarting Host. A successful Host rebuild restarts Host automatically by default; `dev.hostRestart: "manual"` waits for `r`. Interactive `r` requests one Host restart and `q`/Ctrl-C closes the session.

Verify Client HMR and Host restart separately. A browser refresh or an opened DSH page is not proof that the requested Slot, API, Settings, or installer path works. If config/dependency reload fails, DSHX preserves the last-good session while waiting for a valid replacement.

## 6. Finish with proportionate evidence

Normal handoff:

```bash
pnpm check
pnpm test
pnpm build
```

Add `pnpm exec dshx check --runtime` and a real UI/Host scenario for runtime-dependent work. Inspect generated Host/Client artifacts for private DSHX runtime imports, missing provider edges, and unexpected files. Report exactly which layer passed: offline diagnostics, type/tests, build/archive, or real DSH Profile.

Do not commit, publish, push, deploy, submit a Hub entry, or alter a non-disposable Profile unless the user requested that external action.
