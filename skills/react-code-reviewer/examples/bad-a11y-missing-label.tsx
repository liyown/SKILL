/**
 * Bad counterpart: icon-only button with no accessible name.
 * Screen reader users hear "button" with no context; the test
 * suite does not catch this because there is no a11y assertion.
 */
import { Search } from "lucide-react";

export function Toolbar() {
  return (
    <button onClick={onSearch}>
      <Search />
    </button>
  );
}

function onSearch() {}
