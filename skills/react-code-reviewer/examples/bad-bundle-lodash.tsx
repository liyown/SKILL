/**
 * Bad counterpart: importing a single helper from lodash pulls
 * the full library (~24KB gzipped) into the initial bundle.
 */
import { debounce } from "lodash";

export function Search({ onChange }: { onChange: (q: string) => void }) {
  return <input onChange={(e) => onChange(e.target.value)} />;
}

// keep the import "used" for the example
export const _debounce = debounce;
