# Goal Driven Development Example

## Input

```text
Implement the existing spec for order status filtering.
```

## Expected Agent Behavior

1. Read the spec and extract acceptance criteria.
2. Use CodeGraph to locate order list entrypoints and query path.
3. Implement the smallest scoped change.
4. Run the nearest tests.
5. Run Java or React review depending on touched files.
6. Capture stable knowledge in `docs/knowledge/`.
