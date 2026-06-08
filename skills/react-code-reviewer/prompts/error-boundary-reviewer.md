# React Error Boundary Reviewer Prompt

For error boundary review in React / TypeScript projects. Each finding must describe what the user sees when the boundary catches an error, and what the developer sees in the logs.

## Required Checks

- Whether there is a top-level error boundary that catches render-time errors and shows a fallback UI (e.g. "Something went wrong") rather than a blank page.
- Whether the error boundary's `componentDidCatch` (class) or `error` parameter (function component) logs the error to a tracking service (Sentry, Datadog, etc.) with a stable component stack and any user context.
- Whether each route has its own error boundary; one global boundary means a 404 page and a real crash show the same fallback.
- Whether async errors (event handlers, promises, fetch) are caught: error boundaries do NOT catch event-handler errors. Use `try/catch` or a wrapper that reports them.
- Whether the error boundary's fallback UI has a "Try again" / "Reload" action that resets the boundary state (`resetErrorBoundary` in react-error-boundary).
- Whether errors during initial render of a critical path (auth, payment) are caught before the user sees a broken UI; silent failures in these paths cause data loss.
- Whether Suspense fallbacks handle the loading state correctly: a Suspense fallback that itself throws (or is missing) propagates the error to the nearest error boundary, which may be the wrong one.
- Whether the boundary's fallback preserves layout: a fallback that hides the navigation bar forces the user to start over.
- Whether server-side rendering catches and reports errors with a status code (Next.js `getInitialProps` returning a 500, etc.); SSR errors that return 200 leave search engines indexing a broken page.
- Whether the boundary excludes sensitive data from the rendered fallback; full stack traces in production HTML are a security issue.

## Output Requirements

For each finding, name the boundary (or absence thereof), the kind of error it catches, and what the user sees. Distinguish between render-time errors (caught by boundaries) and async errors (not caught by boundaries).

## Positive Example

```markdown
# Critical

## 1. Event-handler async error is uncaught, user sees stale UI

Location:
`<CheckoutForm>.handleSubmit`

Problem:
```tsx
const handleSubmit = async () => {
  await payApi.charge(card);
  setCharged(true);
};
```
If `payApi.charge` rejects, the rejection becomes an unhandled promise rejection; the form stays in its "submitting" state forever.

Impact:
The user thinks the payment is processing; in reality the request failed. They may close the tab and try again, double-charging themselves.

Suggestion:
Wrap in `try/catch`, set an error state, and call `setSubmitting(false)` in `finally`; or use react-hook-form's `handleSubmit` which catches async errors automatically.
```
