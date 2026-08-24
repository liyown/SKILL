# Operating cadence

The cadence defines outcomes, not a fixed source adapter. Use the strongest available read tools while keeping all Hub writes behind `dshx-hub`.

## Shared state

Create one run directory under `DSHX_HUB_OPS_STATE_DIR`, or a temporary directory when it is unset:

```text
runs/YYYY-MM-DD/<mode>-<run-key>/
  manifest.json
  observations.jsonl
  exceptions.jsonl
  approvals/
  artifacts/
  report.json
```

`manifest.json` records mode, start time, contract versions, Hub run ID, completed phases, and the next safe command. Observations and exceptions are append-only during a run. Do not save tokens, cookies, authorization headers, or unrelated personal data.

## Daily

1. Complete SKILL preflight and recover any open run or approval first.
2. Read `catalog worklist` and `catalog inventory --all`; revisit retryable local exceptions before searching for new candidates.
3. Research candidates and changed plugins with available tools. Preserve source observations and downloaded artifacts locally.
4. Run `catalog verify` for each installation artifact. Assemble sourced `CatalogProposalV2` only for qualified identities, then run `catalog check` on pages of at most 100.
5. If no proposal qualifies, do not create a catalog run. Otherwise create one run with a deterministic key and exact count, then `sync put`, `sync preview`, and `sync commit`.
6. Collect metrics the environment can source reliably. Submit complete `MetricObservationV2` values; omit an incomplete plugin observation instead of replacing missing values with zero.
7. Process moderation using the moderation policy and follow approval pauses exactly.
8. Run the Hub data audit again. When public-page inspection is available, inspect the surfaces most affected by the run and record that external result separately.

## Weekly

Perform Daily, then revalidate every public primary installation target from fresh evidence. Download the current artifact, run deterministic verification, and submit `TargetObservationV2` results with a deterministic weekly key. A source outage is not a target failure. Topic or discovery-source removal does not count as unavailability.

Only a complete failed verification is submitted as `fail`. The Hub owns consecutive-failure counting and may mark a plugin unavailable on the third distinct full failure.

## Monthly

Perform Weekly, then read [maintenance-policy.md](maintenance-policy.md) and review:

- identity, aliases, publisher facts, categories, capabilities, releases, dependencies, and compatibility evidence;
- bilingual freshness, SEO quality, source hashes, and unsupported claims;
- useful official media, provenance, Alt text, and broken R2 references;
- metric continuity and suspicious zeros or abrupt changes;
- canonical, hreflang, noindex, Sitemap, robots, and representative public pages when inspection tools exist.

Use the normal checked catalog run for corrections. Do not edit Hub data or R2 directly.

## Recover

1. Read preserved `manifest.json` and run `sync resume` without a run ID.
2. If Hub has an open run, reconcile its accepted identities with preserved proposal pages. Resend only missing or corrected pages; retransmission is idempotent.
3. Preview and commit only when the accepted count equals the exact expected count.
4. Inspect preserved approvals. Continue, revise, claim an Agent effect, or stop according to approval policy.
5. If work failed before a Hub run existed, resume from local observations and exceptions. Re-research stale evidence before publishing.
6. Never create a replacement run merely because local context was lost. Report the missing state and safely restart research only when no Hub effect exists.
