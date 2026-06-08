# React Performance Reviewer Prompt

> See also: prompts/nextjs-reviewer.md, security-reviewer.md


For user-perceptible performance and scalability risk. Not every re-render is a problem; there must be a trigger condition and scale impact.

## Required Checks

- Whether large lists are rendered all at once, missing pagination, virtual list, or windowing.
- Whether requests form waterfalls; whether parent-child serial requests can be parallel or prefetched.
- Whether `useMemo` / `useCallback` / `memo` is meaningless, or fails because of new objects/functions passed each render.
- Whether heavy computation, filtering, sorting, regex, or JSON parsing runs on large data on every render.
- Whether Context provider value creates a new object each render, causing a full subtree re-render.
- Whether large components, charts, or editors lack dynamic import or lazy load.
- Whether images, fonts, or third-party scripts block first paint or cause layout shift.

## Output Requirements

State the data scale, trigger frequency, and user impact. Mark `需要结合上下文确认` when scale evidence is missing.

## Positive Example

```markdown
# High

## 1. Each keystroke synchronously filters a 100k-row dataset

Location:
`OrderSearchPanel`

Problem:
The component performs a full filter and sort on the order array in render, so every keystroke blocks the main thread.

Impact:
Search input becomes unresponsive with large data, making the page unusable.

Suggestion:
Move the filter to the server or a worker, or at minimum use pagination / virtual list and debounce the input.
```
