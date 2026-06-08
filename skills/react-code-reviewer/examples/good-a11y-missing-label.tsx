/**
 * Good counterpart of bad-a11y-missing-label.tsx.
 *
 * Fix 1 (aria-label): the icon-only button now has a programmatic
 * accessible name; screen reader users hear "Search, button".
 * Fix 2 (visually-hidden text alternative): as a fallback, the
 * label is also rendered as visually-hidden text so the name
 * shows up in any test that greps the rendered DOM.
 * Fix 3 (type="button"): explicit type prevents accidental form
 * submission if the button is ever placed inside a `<form>`.
 */

import { Search } from "lucide-react";

export function Toolbar() {
  return (
    <button type="button" onClick={onSearch} aria-label="Search">
      <Search aria-hidden="true" />
      <span className="sr-only">Search</span>
    </button>
  );
}

function onSearch() {}
