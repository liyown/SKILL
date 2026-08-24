# Research and evidence policy

## Adapt to available capabilities

At the start of a run, inventory usable public-read capabilities: structured APIs or connectors, browser/search, repository or registry clients, file download, archive inspection, and visual inspection. This is routing information, not a quality score. Use alternate tools when one is missing; isolate work that cannot be evidenced without inventing facts.

The skill has no required external provider. External tools may read public sources, but Hub writes always go through `dshx-hub`.

## Source authority

Use authoritative first-party material for publication facts:

- package registry metadata and the exact published archive;
- repository manifest, immutable commit/tag, releases, license, and maintained documentation;
- official owner/project profiles for publisher and homepage facts.

Search results, topic listings, directories, social posts, and mirrors are discovery leads. They may locate a candidate but do not prove identity, integrity, compatibility, ownership, or installation facts. When authoritative sources conflict, record both observations and do not choose the more convenient value without evidence.

## Candidate dossier

For each researched identity, append a local observation containing:

- candidate and stable identity hypothesis;
- source URL, source kind and purpose, observation time, immutable ref or etag when present, and SHA-256 when content was saved;
- facts extracted from that source, without editorial rewriting;
- downloaded artifact paths and hashes;
- conflicts, missing facts, and the next useful research action.

Keep excerpts minimal and never store source credentials. Refresh time-sensitive observations before a later run publishes them.

## Discovery and prioritization

Prioritize Hub submissions and previously isolated retryable candidates, then changed published plugins, then new ecosystem discoveries. Prefer candidates with a clear install target and maintained authoritative sources. Popularity may prioritize research but never lowers verification or content standards.
