# DSHX authoring API map

Open only the reference for the requested contribution. English URLs are listed; replace `/en/` with `/zh/` for Chinese. Verify signatures against the installed package.

| Need                               | Public module and API                                                                                             | Reference                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Host module, Tool, Command, Prompt | `@becomeopc/dshx/host`: `defineHost`, `defineTool`, `defineCommand`, `definePromptSection`, `definePromptContext` | https://dshx.io/en/docs/host-contributions |
| Client, plugin copy, or React Slot | `@becomeopc/dshx/client`: `defineClient`, `defineLocale`, `defineSlot`, `PropsLocaleOf`                           | https://dshx.io/en/docs/project-model      |
| Persistent typed configuration     | `@becomeopc/dshx/settings`: `defineSettings`; Client `useSettings`                                                | https://dshx.io/en/docs/settings           |
| Host calls from React              | `@becomeopc/dshx/api`: `method`, `defineApi`; Client `useApi`, `useApiQuery`                                      | https://dshx.io/en/docs/typed-api          |
| Assembled conversation node UI     | `@becomeopc/dshx/experimental/conversation`: `defineConversation(...).render(Component)`                          | https://dshx.io/en/docs/conversation       |
| Config, build, dev, inspect, add   | Root/config `defineConfig`; bounded Vite plugins; `dshx` CLI                                                      | https://dshx.io/en/docs/cli-and-inspect    |
| Programmatic compiler/compat/CLI   | `@becomeopc/dshx/tooling` (Experimental, Node-only)                                                               | https://dshx.io/en/docs/compatibility      |

## Host contributions

`defineHost()` accepts Tools, Commands, Prompt Sections/Contexts, Settings Host ownership, typed API Hosts, and top-level `setup(ctx)`. DSHX derives and deduplicates official service injection, but official packages retain registration, scope, ordering, shadowing, assembly, and disposal. Use an `AbortSignal` for cancellable work and keep browser-submitted data away from process/command selection.

## Client, Locale, and Slots

`defineClient()` accepts `name`, direct Cordis `inject`, opaque `locales`, experimental `conversations`, `slots`, and `setup`. It has no API or Settings declaration field.

For plugin-owned copy:

```tsx
import {
  defineClient,
  defineLocale,
  defineSlot,
  type PropsLocaleOf,
} from "@becomeopc/dshx/client";

const copy = defineLocale("my-plugin.status", {
  zh: { ready: "已就绪" },
  en: { ready: "Ready" },
});

function Status({ t }: PropsLocaleOf<typeof copy>) {
  return <p>{t("ready")}</p>;
}

const slot = defineSlot("sidebar.footer.action", {
  id: "my-plugin.status",
  locale: copy,
  component: Status,
});

export default defineClient({ locales: [copy], slots: [slot] });
```

`zh` and `en` are both required, have exactly the same keys, and contain string values. `LocaleKeyOf<typeof copy>` extracts those keys; `PropsLocaleOf<typeof copy>` provides the typed `t`. A non-empty `locales` array registers/disposes dictionaries before Slots and automatically requests the Cordis `locale` service. The package still needs `@deepseek-ai/dsh-client-locale` in `dsh.client.inject`. Raw namespace strings remain for official/provider-augmented `LocaleNamespaceMap` use and do not register dictionaries.

`defineSlot(name, options)` is typed by the provider's augmented `SlotMap`. Import that provider's Client declaration and package edge. Pass the opaque result to `defineClient.slots`; do not inspect or recreate it.

Retained Hooks are analyzed after tree-shaking:

- `useSettings()` adds `settingsScope` and requires `@deepseek-ai/dsh-client-ui-settings`.
- `useApi()` or `useApiQuery()` adds `connection` and requires `@deepseek-ai/dsh-client-connection`.

## Settings and typed API

Define each Settings contract once and register its Host ownership once. Host `base`, `validate`, and `setup` remain Node-only. Secret fields need a Client decoder that removes readable values; write-only mutations may still accept them.

Define unary API methods once, implement every method through `contract.host()`, and call them from a DSHX React renderer. Standard Schema transforms execute at the Host boundary. Authorization, revision fences, idempotency, durable outcomes, error redaction, and cancellation are Host responsibilities.

## Conversation Components

Define a non-empty `kind`, official Session event descriptors, deterministic `initial`, required `reduce` for updates, and optional `project`. Attach one React component with `.render(Component)` and place that opaque contribution in `defineClient.conversations`. Custom durable event vocabulary outside official `SessionEventMap` is not a published compatibility guarantee.

## Build extensions

Use standard Vite plugin factories only through `host.vite.plugins` or `client.vite.plugins`. DSHX owns entries, targets, format, externals, chunks, and asset policy. Tailwind v4 should use its official Vite plugin, complete static class names, a plugin-specific prefix, and no Preflight unless a global DSH document reset is explicitly accepted.
