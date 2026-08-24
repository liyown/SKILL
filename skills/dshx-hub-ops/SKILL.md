---
name: dshx-hub-ops
description: Operate and maintain DSHX Hub through its stable CLI while using whatever research capabilities are available. Use for adaptive daily, weekly, monthly, or recovery work covering catalog research, sourced bilingual content, local artifact verification, metrics, media, moderation, maintenance, and approval-aware continuation.
---

# DSHX Hub Operations

Use judgment and the environment's available read tools to research and maintain Hub. Route every Hub or R2 write through `dshx-hub`; never call Hub write APIs directly, edit the website, deploy code, expose secrets, or execute third-party package scripts.

## Choose the mode

Use `daily` when no mode is specified.

- `daily`: recover unfinished work, process current catalog/community work, refresh obtainable metrics, and check health.
- `weekly`: daily work plus complete installation-target and source revalidation.
- `monthly`: weekly work plus catalog, content, media, SEO, and long-term data-quality review.
- `recover`: continue the newest preserved run or approval before starting new research.

Read [references/cadence.md](references/cadence.md) for the selected mode. Before a catalog write, read [references/research-policy.md](references/research-policy.md), [references/catalog-policy.md](references/catalog-policy.md), and [references/content-policy.md](references/content-policy.md). Read the media, maintenance, moderation, approval, or exception reference only when that branch is active.

## Preflight and capability assessment

1. Require `dshx-hub` and a non-empty `DSHX_HUB_URL`.
2. Run `dshx-hub auth status`, `dshx-hub contract show --kind catalog`, and `dshx-hub maintenance audit --scope daily`. Stop Hub writes on authentication failure, a contract version the CLI cannot handle, or any critical audit issue.
3. Inspect the tools actually available for public research, file download, archive access, and visual inspection. Do not require a named provider or pretend a missing capability exists.
4. Use `DSHX_HUB_OPS_STATE_DIR` when set. Otherwise create a dedicated temporary directory and warn that recovery after the current environment ends is limited. Never store credentials there.
5. Check preserved manifests, exceptions, approvals, and open Hub runs before selecting new work.

## Operating loop

Prefer work in this order: recover an open run or actionable approval; process Hub worklist items; revisit retryable local exceptions; refresh existing catalog data; then discover new candidates.

For each branch, gather evidence with available tools, distinguish sourced facts from inference, and save a local observation. Query Hub inventory before treating a candidate as new. Use `catalog verify` for local package archives and `catalog check` for completed proposals. Create a sync run only after at least one proposal qualifies and use the exact qualified count.

Missing capabilities, incomplete facts, invalid candidates, or unclear media rights are normal local exceptions. They are not approvals. Create an approval only for a registered high-risk decision described by [references/approval-policy.md](references/approval-policy.md).

## Authorization and stopping

This skill may publish qualified catalog data, submit sourced metrics and target checks, upload validated media, dismiss insufficient reports, hide clear violations, and apply policy-bounded temporary restrictions. It may prepare an approval but may not approve its own request, permanently ban, restore content, lift a restriction, change roles, force identity or ownership, deploy, modify source, or install a scheduler.

Stop the affected branch when evidence changes during assembly, deterministic validation fails, identity remains ambiguous, an atomic Hub effect fails, or the CLI returns `awaitingApproval: true`. Stop all Hub writes on authentication, contract, Hub availability, or critical consistency failures. Preserve the exact evidence, state, and resume command rather than improvising around a guardrail.

Finish with a structured report covering completed effects, isolated work, skipped work and capability gaps, approvals, audits, and the exact recovery entrypoint.
