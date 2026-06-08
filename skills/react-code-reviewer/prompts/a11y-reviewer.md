# React Accessibility (a11y) Reviewer Prompt

For accessibility review in React / TypeScript projects. Each finding must affect real assistive-tech users, not theoretical purity.

## Required Checks

- Whether interactive elements are `<button>`, `<a>`, or have `role="button"` plus `tabIndex={0}` plus key handlers. `<div onClick>` is not keyboard accessible.
- Whether icon-only buttons have `aria-label`; an empty `aria-label` is worse than none because it explicitly says "no label".
- Whether form inputs have associated `<label htmlFor>` or `aria-labelledby`; placeholder text is not a label.
- Whether images have `alt`; decorative images have `alt=""` (empty, not absent) so screen readers skip them.
- Whether focus management on route change moves focus to the new page's `<h1>` or main landmark, not leaves it on the now-defunct link.
- Whether modals trap focus (`focus-trap-react` or hand-rolled) and restore focus to the trigger on close; an open modal that lets tab escape the dialog breaks screen reader users.
- Whether the colour contrast ratio meets WCAG AA (4.5:1 for body text, 3:1 for large text). Brand colours that fail contrast are not optional.
- Whether live regions (`aria-live="polite"`, `aria-live="assertive"`) wrap dynamic content (toast, error, success). Without them, screen reader users miss the update.
- Whether the page has a single `<h1>`, then a logical `<h2>` / `<h3>` outline. Skipped heading levels break document navigation.
- Whether `prefers-reduced-motion` and `prefers-color-scheme` are respected; users with vestibular disorders and visual sensitivities depend on these.
- Whether form errors are announced (`aria-live="polite"` region) so screen reader users know the submit failed.

## Output Requirements

For each finding, name the element or component, the affected user group (screen reader / keyboard-only / low vision / cognitive), and the user impact (cannot complete task, cannot perceive state, etc.).

## Positive Example

```markdown
# High

## 1. Modal without focus trap lets Tab escape the dialog

Location:
`<ConfirmDeleteDialog>`

Problem:
The dialog opens but tabindex is not trapped inside; Tab moves focus to the underlying page buttons.

Impact:
A screen reader user thinks they are still in the dialog; pressing Enter activates a button in the page they cannot see.

Suggestion:
Use `focus-trap-react`, or hand-roll a keydown handler on the dialog that captures Tab and Shift+Tab and wraps focus between the first and last focusable elements.
```
