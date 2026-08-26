# DSHX plugin package and Preview checklist

Read this only when the user asks to package, publish, or prepare a release. Remote publication, tag push, Hub submission, deployment, and non-disposable Profile mutation each require explicit authorization.

## Manifest and archive

Confirm the public package has:

- name, description, keywords, license, repository directory, bugs, homepage, and Node engine;
- `publishConfig.access: "public"` for a public scope;
- `files`, `main`, `types`, and `exports` paths that match built output;
- an `@deepseek-ai/dsh` peer range contained by one supported protocol generation and one concrete local DSH dev version;
- official runtime imports represented as peers, plus correct `dsh.client.inject` provider edges and runtime externals;
- README and LICENSE, with no credentials, Profile data, terminal logs, fixtures, workspace-only specifiers, or unintended source maps.

Build and inspect the actual package:

```bash
pnpm check
pnpm test
pnpm build
pnpm pack --dry-run
```

When possible, pack to a temporary directory, list the archive contents, install that `.tgz` through the official `dsh plugin --profile <profile> add <archive>` command, restart a disposable Profile, and verify both the manifest/bundle list and the requested UI or Host registration. Workspace imports are not package proof.

## Publish an ordinary plugin to Preview

Preserve npm `latest` and use an explicit prerelease:

```bash
npm whoami
npm publish --tag preview
npm view <package>@preview version dist-tags
```

Complete 2FA interactively and never store npm credentials in the repository. Check package write access before publishing. After an uncertain response, inspect npm before retrying; do not blindly change the command or version.

The DSHX monorepo has its own guarded Changesets pre-mode runbook. Follow that repository's current `docs/releasing.md` and `publish-plan`; do not replace it with the ordinary-plugin command above.

## Post-publication evidence

- install from `@preview` in a clean temporary project/Profile;
- confirm npm metadata, dist-tag, integrity, archive contents, binary/exports, and declarations;
- run offline `check` and `build` from a clean generated consumer;
- verify Client HMR and Host restart separately when relevant;
- confirm npm `latest` did not move unintentionally;
- treat Framework Hub publication as a separate curated action with an exact active primary package/version target and valid DSH compatibility range.

Report what was published and what remains pending. Do not claim Hub availability from npm success alone.
