# React State Management Reviewer Prompt

For state management review in React / TypeScript projects using Redux Toolkit, Zustand, Jotai, Recoil, MobX, or React Context.

## Required Checks

- Whether global state is actually needed; component-local `useState` is usually cheaper than a global store. Don't reach for Zustand for a single component.
- Whether Redux slices are normalized (id-keyed maps) instead of nested arrays; nested data causes O(n) updates for every change.
- Whether selectors are stable and memoized; `useSelector((state) => state.x.y)` re-runs every dispatch. Use `createSelector` (reselect) or memoize.
- Whether Zustand stores are split by domain (`useUserStore`, `useCartStore`) rather than one mega-store; one change in a mega-store re-renders every subscriber.
- Whether Context providers wrap only the consumers that need the value; placing `value={{ a, b, c }}` inline on a provider re-renders the whole tree every render.
- Whether the store update path is immutable (spread / immer / structuralClone) — direct mutation of state in Redux/Zustand breaks devtools and the time-travel debugger.
- Whether async actions (RTK Query, React Query, SWR, TanStack Query) cache the response and use a stable cache key; missing cache invalidation causes stale UI after a mutation.
- Whether the store exposes only the actions consumers need, not the raw setter; `setUser` is more dangerous than `updateProfile({ name })` because callers can mutate fields they shouldn't.
- Whether server cache and client cache are kept separate; mixing Redux with React Query usually means duplicating the same data in two places.
- Whether store hydration is SSR-safe (Zustand `persist` middleware with `skipHydration` then explicit `rehydrate`, etc.) — naive `localStorage.getItem` on first render throws on the server.

## Output Requirements

For each finding, name the library in use, the specific selector or store, and the user-observable failure (stale data, unnecessary re-render, broken SSR).

## Positive Example

```markdown
# High

## 1. Zustand store returns a new object on every render, triggering downstream re-renders

Location:
`useAppStore`

Problem:
```ts
export const useAppStore = create((set) => ({
  user: null,
  theme: 'light',
  setUser: (u) => set({ user: u }),
}));
```
A selector `useAppStore((s) => ({ user: s.user, theme: s.theme }))` returns a new object every render and forces every consumer to re-render.

Impact:
Every component subscribed to this store re-renders on every dispatch anywhere in the app, even unrelated ones.

Suggestion:
Use the shallow comparator: `useAppStore((s) => ({ user: s.user, theme: s.theme }), shallow)`, or expose the two values as separate selectors.
```
