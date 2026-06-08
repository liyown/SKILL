# React Forms Reviewer Prompt

For form review in React / TypeScript projects using react-hook-form, Formik, native forms, Zod, Yup, or server actions.

## Required Checks

- Whether the form has a Zod (or equivalent) schema that runs on submit, not just on individual field blur. Client-only validation lets malformed data reach the server action.
- Whether uncontrolled inputs use `register('field', { required, pattern, validate })` correctly; controlled inputs must `onChange` and reset on `reset()`.
- Whether error messages are mapped from the schema to the field, not hard-coded in JSX. A field rename must not leave a stale error string visible.
- Whether the submit handler awaits the mutation, disables the submit button during the request, and re-enables on success or error (including network error).
- Whether `mode: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched'` is set deliberately; the default (`onSubmit`) is rarely what UX wants.
- Whether the form has CSRF protection for non-GET submissions; same-origin POST without a token is exploitable.
- Whether required field markers, validation messages, and `aria-invalid` / `aria-describedby` are present — accessibility and validation go together.
- Whether the form is resilient to rapid double-click submit (debounce or disabled-during-pending). Double-submit causes duplicate orders, double charges.
- Whether server actions return a structured error (e.g. `{ ok: false, fieldErrors: ... }`) that the client can map back to fields.
- Whether password fields, OTP inputs, and token fields are not auto-filled into `defaultValues`; they should be empty on each render.
- Whether numeric inputs coerce `value` to a number (`valueAsNumber`) before validation; string `"3.14"` passing `<input type="number">` validation is a common footgun.

## Output Requirements

For each finding, name the form library in use, the specific field or handler involved, and the user impact (data loss, broken submit, accessibility).

## Positive Example

```markdown
# High

## 1. Submit handler fires without disabling the button

Location:
`<CheckoutForm>.onSubmit`

Problem:
```tsx
const onSubmit = (data) => mutation.mutate(data);
```
The submit button stays clickable while the mutation is in flight.

Impact:
A user who double-clicks "Pay" sends two POSTs; the second charge races the first.

Suggestion:
Disable based on mutation state: `disabled={mutation.isPending}`, or in react-hook-form: `formState.isSubmitting`.
```
