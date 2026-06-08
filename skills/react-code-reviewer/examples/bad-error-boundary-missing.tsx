/**
 * Bad counterpart: no top-level error boundary. A render error
 * in any descendant unmounts the entire tree; the user sees a
 * blank page and a "white screen of death".
 */
import { useState } from "react";

function MaybeThrows({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("boom");
  return <div>ok</div>;
}

export function App() {
  const [bad, setBad] = useState(false);
  return (
    <>
      <button onClick={() => setBad(true)}>trigger</button>
      <MaybeThrows shouldThrow={bad} />
    </>
  );
}
