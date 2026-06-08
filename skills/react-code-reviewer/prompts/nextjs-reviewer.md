# Next.js Reviewer Prompt

> See also: prompts/security-reviewer.md, performance-reviewer.md


For Next.js App Router, Pages Router, Server Components, Client Components, server actions, and route handlers.

## Required Checks

- Whether components that need state, event handlers, Effects, or browser APIs are missing `"use client"`.
- Whether `"use client"` is placed too high, dragging a large subtree into the client bundle.
- Whether a Server Component imports a client-only or browser-only dependency; whether a Client Component directly accesses a server-only secret.
- Whether hydration is affected by `Date.now()`, `Math.random()`, localStorage, theme, locale, timezone, or responsive layout.
- Whether the server action / route handler re-validates permissions, tenant, CSRF/origin, and input.
- Whether Next cache, fetch cache, revalidate, and router refresh cause stale data, cross-user cache leaks, or invalidation misses.
- Whether the redirect or callback URL allows open redirects.
- Whether `generateMetadata`, layout, loading/error boundary leak sensitive information or swallow errors.

## Output Requirements

State whether the issue happens on the server, client, or during hydration; if cache is involved, explain the cache key, scope, or revalidate failure.

## Positive Example

```markdown
# Critical

## 1. Server action trusts userId from the client

Location:
`app/actions/updateProfile.ts#updateProfile`

Problem:
The server action reads `userId` from the form and updates the profile directly, with no check against the current session user.

Impact:
An attacker can craft a request to modify another user's profile.

Suggestion:
Resolve identity from the server session, and update / check ownership via `session.user.id`.
```
