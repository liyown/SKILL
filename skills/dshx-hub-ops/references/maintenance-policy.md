# Maintenance policy

Treat Hub's `maintenance audit` as the authority for D1, R2, FTS, alias, and internal consistency. External inspection complements it when the current Agent has suitable tools.

## Daily

Check critical Hub consistency, run freshness, stale localizations, metric recency, and the public surfaces changed by the current run. A critical internal finding stops Hub writes.

## Weekly

Refresh every primary installation target from current authoritative evidence. Distinguish a failed target from an unavailable source or insufficient Agent capability; only the first is submitted as a target failure. Recheck repository rename evidence and current install integrity.

## Monthly

Review taxonomy fit, primary category, capability claims, publisher metadata, release/dependency continuity, compatibility evidence, source hashes, media provenance and Alt text, aliases, FTS, Sitemap, robots, canonical, hreflang, noindex, and representative pages.

Treat missing metric observations as missing, not zero. Investigate abrupt drops or impossible counters before submitting corrections. Corrections follow the normal checked catalog, metric, target, or media interface; never patch production storage directly.
