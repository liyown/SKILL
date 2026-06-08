/**
 * Bad counterpart: submit button stays clickable while the mutation
 * is in flight. A double-click sends two POSTs; the second races
 * the first and may double-charge.
 */
import { useState } from "react";

export function CheckoutForm() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await fetch("/api/charge", { method: "POST" });
        setSubmitting(false);
      }}
    >
      <button type="submit">Pay</button>
    </form>
  );
}
