/**
 * Good counterpart of bad-state-store-recreate.tsx.
 *
 * Fix 1 (separate selectors): each value is selected with its own
 * call so Zustand's default reference equality applies. The header
 * only re-renders when `user` or `theme` actually changes.
 * Fix 2 (shallow comparator fallback): if a composite selector is
 * truly needed, use the `shallow` comparator so identity is checked
 * field-by-field instead of by reference.
 */

import { create } from "zustand";
import { shallow } from "zustand/shallow";

type State = { user: { name: string } | null; theme: string };

const useApp = create<State>(() => ({ user: { name: "u" }, theme: "light" }));

export function Header() {
  const user = useApp((s) => s.user);
  const theme = useApp((s) => s.theme);
  void shallow;
  return <div>{user?.name} {theme}</div>;
}
