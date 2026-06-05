# React Code Reviewer Skill

`react-code-reviewer` reviews React, TypeScript, Next.js, and Vite frontend changes for concrete production risk.

## Focus

- Hooks, dependencies, stale closures, cleanup
- Async race conditions and failed loading/error states
- Next.js Server/Client Component boundaries and hydration
- XSS, unsafe URLs, token exposure, frontend-only authorization
- User-visible performance and accessibility failures

## Usage

Load `SKILL.md`, then `prompts/reviewer.md`. Add scenario prompts when relevant.

If no clear high-risk issue is found, output:

```text
未发现明确高风险问题。
```
