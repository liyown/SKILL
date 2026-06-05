---
name: react-code-reviewer
description: Review React, TypeScript, Next.js, and Vite frontend changes for production-risk bugs in hooks, state, async effects, routing, authorization UI, SSR/CSR boundaries, hydration, security, accessibility, performance, and maintainability. Use for React code review, frontend PR review, diff review, or release-risk inspection.
metadata:
  short-description: Evidence-driven React frontend review
---

# React Code Reviewer

Review React frontend code for user-visible and production-risk defects. Load detailed prompts only when the code needs them.

## Required Loading

Always load `prompts/reviewer.md`.

Load additional prompts only when relevant:

- `prompts/nextjs-reviewer.md`: Next.js App Router, Server/Client Components, server actions, route handlers, cache, hydration.
- `prompts/security-reviewer.md`: XSS, unsafe HTML/URLs, token storage, open redirects, sensitive data exposure.
- `prompts/performance-reviewer.md`: unnecessary renders, memo misuse, bundle growth, request waterfalls, large lists.

## Review Contract

- Output concrete issues only.
- Bind each finding to code evidence and a user/runtime impact.
- Mark uncertain findings as `需要结合上下文确认`.
- If no clear high-risk issue is found, output exactly:

```text
未发现明确高风险问题。
```

Use the severity and output contract from `prompts/reviewer.md`.
