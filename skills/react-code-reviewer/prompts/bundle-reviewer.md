# React Bundle / Dynamic Import Reviewer Prompt

For bundle size and code-splitting review in React / TypeScript projects. Each finding must connect a specific import or import pattern to a measurable bundle or runtime cost.

## Required Checks

- Whether heavy libraries (lodash full bundle, moment, antd full icon set, date-fns full) are imported by name. `import { debounce } from 'lodash'` pulls the whole library; use `lodash/debounce` or `lodash-es` with tree-shaking, or replace with a 10-line local implementation.
- Whether the route-level code is split: each route should be in its own chunk, not bundled into the main entry. Verify with `react-router` lazy, Next.js dynamic imports, or `React.lazy` + `<Suspense>`.
- Whether below-the-fold components (modals, drawers, heavy charts, rich-text editors) are dynamically imported. A 200KB chart library loaded on initial render is a problem; loaded when the user opens the chart, it's not.
- Whether icon imports are tree-shaken: `@mui/icons-material/<Specific>` not `@mui/icons-material`; `react-icons/<lib>/<name>` not the full barrel.
- Whether the `package.json` `sideEffects: false` field is set when no module has side effects, so webpack/vite can drop unused exports.
- Whether `import` is preferred over `require`; mixed module systems in one file break tree-shaking in some bundlers.
- Whether barrel files (`index.ts` re-exporting everything) are avoided in hot paths. A single `import { Foo } from '../components'` can drag in every component in the folder.
- Whether `React.lazy` is paired with `<Suspense fallback={...}>`; the lazy import returns a promise that must be awaited, and during the wait the fallback is shown.
- Whether server-only modules (Node-built-ins, database drivers) are not imported into client components. Next.js' `"use server"` / `import 'server-only'` prevents this; React without a framework has no such guard.
- Whether polyfills are scoped to the browsers actually in use; babel's `@babel/preset-env` with broad targets can polyfill features for IE 11 in a 2026 codebase.

## Output Requirements

For each finding, estimate the bundle cost (rough kb is fine), name the import line, and propose a specific alternative. Do not flag small libraries (< 5KB gzipped) — flagging `clsx` is theatre.

## Positive Example

```markdown
# High

## 1. `import { debounce } from 'lodash'` pulls the full library

Location:
`<SearchInput>`

Problem:
```ts
import { debounce } from 'lodash';
```
Lodash full bundle is ~70KB minified / ~24KB gzipped. A search input is loaded on every page.

Impact:
Initial page load is 24KB heavier than necessary; the user pays this cost on every route, even routes that do not use SearchInput.

Suggestion:
Use `import debounce from 'lodash/debounce'` (deep import), or write a 10-line debounce inline. Or use `lodash-es` with `sideEffects: false` for tree-shaking.
```
