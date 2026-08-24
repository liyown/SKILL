# Media policy

Media discovery and download belong to the Agent. The CLI only validates local bytes and uploads them through Hub.

## Selection

Prefer, in order, an official repository/package icon, an official project-site asset, and genuine product screenshots maintained by the project. Do not substitute generic search images, generated decorations, social preview cards with unrelated text, or third-party directory thumbnails.

Record the source URL, observation time, local file, SHA-256, intended role, and evidence that the project controls or permits the asset. If provenance or reuse rights are unclear, keep a local exception and do not upload. Missing media does not block an otherwise qualified plugin.

## Preparation and upload

Download the exact file locally without executing embedded content. Use `media check` to verify magic bytes, MIME, size, dimensions, hash, and unique English/Chinese Alt text. Alt text describes the visible asset and relevant UI state; it is not keyword stuffing.

Only after a successful check use `media upload`. A changed source hash requires fresh review. Never write R2 directly or ask the CLI to fetch `sourceUrl`.
