/**
 * Bad counterpart: Zustand selector returns a fresh object on
 * every render, forcing every subscriber to re-render even when
 * the underlying state is unchanged.
 */
import { create } from "zustand";

type State = { user: { name: string } | null; theme: string };

const useApp = create<State>(() => ({ user: { name: "u" }, theme: "light" }));

export function Header() {
  // new object every render
  const { user, theme } = useApp((s) => ({ user: s.user, theme: s.theme }));
  return <div>{user?.name} {theme}</div>;
}
