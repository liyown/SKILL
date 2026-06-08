# React Frontend Security Reviewer Prompt

> See also: prompts/nextjs-reviewer.md, performance-reviewer.md


For React / Next.js frontend security review. Each finding must describe an exploitable path; do not output generic security reminders.

## Required Checks

- Whether `dangerouslySetInnerHTML` renders untrusted content (user, CMS, Markdown, rich text, URL parameter) without sanitization.
- Whether `href`, `src`, `iframe`, `window.open`, and redirect URL allow `javascript:`, `data:`, or arbitrary external redirects.
- Whether token, session, and personal sensitive data land in localStorage, URL, logs, error reporting, or analytics.
- Whether hiding a button on the frontend is mistaken for authorization; whether critical operations depend on backend authorization.
- Whether CORS, CSRF, cookie sameSite, and credentials use cause cross-site request risk.
- Whether third-party scripts, HTML injection, and Markdown rendering have CSP or sanitizer.
- Whether public env variables leak secrets; whether Next.js `NEXT_PUBLIC_*` exposes server config.

## Output Requirements

State the input source, the rendering / redirect / storage location, and the capability the attacker gains.

## Positive Example

```markdown
# Critical

## 1. CMS HTML rendered without sanitization causes XSS

Location:
`ArticleBody`

Problem:
The component passes `article.html` from the API response directly to `dangerouslySetInnerHTML`, with no sanitizer or trust-bound check.

Impact:
If an attacker can write article content, they can execute scripts to steal user information or perform actions on the user's behalf.

Suggestion:
Sanitize with a whitelist sanitizer on the server or before render, and constrain the allowed tags and attributes.
```
