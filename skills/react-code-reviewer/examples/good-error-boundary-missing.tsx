/**
 * Good counterpart of bad-error-boundary-missing.tsx.
 *
 * Fix 1 (top-level boundary): the entire app is wrapped in an
 * ErrorBoundary that catches render-time errors and shows a
 * recoverable fallback instead of a blank page.
 * Fix 2 (route-level boundary, optional): each route can wrap its
 * own boundary so a 404 page crash does not break the navigation
 * chrome.
 * Fix 3 (log forwarding): the boundary logs the error to a
 * tracking service with a stable component stack.
 *
 * Using react-error-boundary for the worked example; the same
 * pattern works with hand-rolled class components.
 */

import { Component, type ReactNode, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <p>Something went wrong.</p>
      <button type="button" onClick={reset}>Try again</button>
    </div>
  );
}

class LoggerBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    // log to Sentry / Datadog / etc.
    // eslint-disable-next-line no-console
    console.error(error);
  }
  render() {
    if (this.state.error) return <Fallback error={this.state.error} reset={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

function MaybeThrows({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("boom");
  return <div>ok</div>;
}

export function App() {
  const [bad, setBad] = useState(false);
  return (
    <LoggerBoundary>
      <ErrorBoundary FallbackComponent={Fallback}>
        <button type="button" onClick={() => setBad(true)}>trigger</button>
        <MaybeThrows shouldThrow={bad} />
      </ErrorBoundary>
    </LoggerBoundary>
  );
}
