/**
 * Good counterpart of bad-bundle-lodash.tsx.
 *
 * Fix 1 (deep import): `lodash/debounce` imports only the helper,
 * leaving the rest of the library out of the bundle (~0.5KB
 * instead of ~24KB).
 * Fix 2 (or write it inline): for a single helper, a 6-line local
 * implementation avoids the dependency entirely. Either is fine;
 * deep import is the lower-friction choice for projects that
 * already use lodash elsewhere.
 */

import debounce from "lodash/debounce";

export function Search({ onChange }: { onChange: (q: string) => void }) {
  return (
    <input
      onChange={(e) => {
        const v = e.target.value;
        onChange(v);
      }}
    />
  );
}

export const _debounce = debounce;
