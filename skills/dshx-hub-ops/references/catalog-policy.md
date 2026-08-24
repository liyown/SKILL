# Catalog policy

## Stable identity and deduplication

Query `catalog inventory --all` before proposing publication.

- Prefer `npm:<package-name>` when a verified npm artifact is the install target.
- Use `github:<repository-id>:` only for a tagged repository-root Git-only bundle.
- Treat repository names, URLs, slugs, and owners as mutable facts; numeric repository identity is stable across renames.
- Do not infer a merge from similar names, descriptions, code, or branding. An unresolved ownership or identity conflict remains local unless a registered forced-identity approval is genuinely required.

Hub generates plugin UUIDs, preserves published slugs, checks package uniqueness, and creates safe aliases. Do not fabricate database IDs or bypass a Hub identity conflict.

## Evidence and verification

A publishable candidate needs authoritative evidence for its repository, owner, install target, current version, package manifest, declared patch, and required catalog claims. Save the exact package or Git archive locally and create `EvidenceManifestV1`.

`catalog verify` is authoritative for archive safety, integrity, manifest, patch shape, root/monorepo rules, and DSHX detection. It never installs the package or executes scripts. Do not convert a failed attestation into a passing proposal.

Repository and registry availability claims come from Agent evidence; the CLI does not fetch them. Archived or disabled projects, invalid integrity, missing patches, Git-only subdirectories, and untagged Git-only roots do not qualify.

## Proposal assembly

Build `CatalogProposalV2` from verified facts and the current live catalog contract.

- Use only controlled category and capability values returned by `contract show`.
- Keep metrics and media outside the proposal.
- Include one primary install target and at most 20 useful releases.
- Bind both ready localizations to the same `contentSourceHash`.
- Compute that hash only from the hashed sources actually used for editorial content. Stars, downloads, avatars, and other volatile fields are excluded.

Run `catalog check` before staging. One invalid candidate is written to local `exceptions.jsonl` and does not block checked siblings. Build upload pages only from qualified proposals.

## Publication and updates

Do not create an empty run. A run contains at most 500 qualified identities and a page at most 100. An invalid page must write nothing. Preview after all pages and commit only when received and expected counts match.

Metrics changes alone never trigger localization work. When an editorial source digest changes, research the change, regenerate affected content, and use the new content hash. Topic removal alone never unpublishes a plugin. Target unavailability is handled only through distinct complete target submissions.
