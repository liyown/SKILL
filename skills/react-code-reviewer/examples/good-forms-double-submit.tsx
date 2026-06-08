/**
 * Good counterpart of bad-forms-double-submit.tsx.
 *
 * Fix 1 (button disabled while submitting): the button is bound to
 * the local `submitting` state and the form's submit handler
 * cannot re-enter while pending.
 * Fix 2 (idempotency key on the request): even if the request is
 * fired twice (network retry, browser back), the server-side
 * dedup key ensures only one charge is recorded.
 */

import { useState } from "react";

export function CheckoutForm() {
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = crypto.randomUUID();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
          await fetch("/api/charge", {
            method: "POST",
            headers: { "Idempotency-Key": idempotencyKey },
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <button type="submit" disabled={submitting}>
        {submitting ? "Processing…" : "Pay"}
      </button>
    </form>
  );
}
