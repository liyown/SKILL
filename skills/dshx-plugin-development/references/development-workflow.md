# DSHX development workflow

## 1. Classify the task

- **New plugin:** scaffold with `pnpm create dshx <name>`. Choose `starter` or `showcase` and `css-modules`, `tailwind`, or `none`; confirm the target is empty before creation.
- **Existing plugin:** preserve its package manager, public package identity, entry paths, DSH peer range, and unrelated changes.
- **Framework work:** read the repository roadmap, decisions, compatibility registry, and relevant implementation/tests before changing a public contract.

Do not edit the official DSH source when the task is to build an out-of-tree plugin.

## 2. Inspect before designing

Read these files when present:

```text
package.json
dshx.config.ts
cordis.patch.yml
src/host.ts
src/client.tsx
src/settings.ts
src/api/**/*.ts
```

Check the current worktree and search existing definitions before adding files. From `package.json`, distinguish:

- `peerDependencies`: the plugin's public DSH compatibility claim;
- `devDependencies`: the concrete local DSH used for development and verification;
- `dsh.client.inject`: official Client provider package edges;
- `dsh.client.external`: runtime module-table externals.

Run the offline read-only diagnostic before broad changes when dependencies are installed:

```bash
pnpm check
```

Use `pnpm exec dshx check --json` when the package has no check script or structured output is needed. Do not run `check --fix` unless project metadata repair is requested; inspect its dry run first.

Offline `check` does not require a linked Profile. When the task depends on the actual DSH Composition, add the explicit runtime gate:

```bash
pnpm exec dshx check --runtime
```

For provider-owned UI, inspect the running Composition before selecting a Slot:

```bash
pnpm exec dshx inspect slots --json
```

If the relevant Inspect target is unavailable, report that boundary and use installed official types rather than inventing a catalog.

## 3. Implement at the right boundary

- Keep shared Settings and API modules browser-safe.
- Keep Host handlers, Settings base/validate/setup, filesystem access, secrets, and privileged operations out of Client imports.
- Import the provider's Client type augmentation before calling `defineSlot()`.
- Register each declared contribution once. Do not mirror official registries or keep disposer arrays.
- For a Conversation renderer calling the Host, use the ordinary typed API. Durable UI results must return through official Session history; an API response does not mutate assembled nodes.
- Configure CSS or other build transforms with standard Vite plugin factories under the relevant Host or Client face. Do not introduce a second `vite.config.ts` or bypass DSHX output guards.
- For Tailwind v4, use `@tailwindcss/vite`, complete static class names, a plugin-specific prefix, and theme/utilities imports without Preflight by default.

When changing a public DSHX API, update source/runtime/compiler behavior together, add type and runtime tests, update create-dshx when the starter contract changes, record compatibility capabilities, add a changeset, and update the English and Chinese references.

## 4. Verify the requested outcome

Use the project's existing scripts. A normal plugin handoff should include:

```bash
pnpm check
pnpm build
```

Also run relevant unit or type tests. Use `pnpm exec dshx check --runtime` followed by `pnpm dev` for a real DSH session when the change concerns registration, Client rendering, Settings synchronization, API transport, Host restart, or HMR. Verify the exact user path rather than only confirming that DSH opened.

Before reporting completion:

- confirm generated artifacts contain no private DSHX runtime import where the contract requires runtime-thin output;
- confirm required provider packages and Manifest edges are present;
- distinguish unit/build verification from real DSH verification;
- leave the worktree's unrelated state untouched;
- do not commit, publish a package, push, or deploy unless the user requested it.
