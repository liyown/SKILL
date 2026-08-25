# DSHX API map

Open only the reference relevant to the requested contribution. English URLs are listed; replace `/en/` with `/zh/` for Chinese.

| Need                               | Public module and API                                                                                             | Reference                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Host module, Tool, Command, Prompt | `@becomeopc/dshx/host`: `defineHost`, `defineTool`, `defineCommand`, `definePromptSection`, `definePromptContext` | https://dshx.io/en/docs/host-contributions |
| Client module or React Slot        | `@becomeopc/dshx/client`: `defineClient`, `defineSlot`                                                            | https://dshx.io/en/docs/project-model      |
| Persistent typed configuration     | `@becomeopc/dshx/settings`: `defineSettings`; Client `useSettings`                                                | https://dshx.io/en/docs/settings           |
| Host calls from React              | `@becomeopc/dshx/api`: `method`, `defineApi`; Client `useApi`, `useQuery`                                         | https://dshx.io/en/docs/typed-api          |
| Assembled conversation node UI     | `@becomeopc/dshx/conversation`: `defineConversation(...).component(...)`                                          | https://dshx.io/en/docs/conversation       |
| Project configuration, builds, CLI | `@becomeopc/dshx/config`, `/compiler`, `/cli`                                                                     | https://dshx.io/en/docs/cli-and-inspect    |
| DSH version and adapter capability | `@becomeopc/dshx/compat`                                                                                          | https://dshx.io/en/docs/compatibility      |

## Contribution rules that affect design

### Host

`defineHost()` registers Tools, Commands, Prompts, Settings, APIs, then top-level `setup(ctx)`. Non-empty fields add and deduplicate their required official service injection. Preserve declaration order and let official packages handle duplicates and disposal.

### Client

`defineSlot(name, options)` is typed by the provider's augmented `SlotMap`. `defineClient()` has `slots`, explicit experimental `conversations`, optional compatibility `api/apis`, and `setup`; it has no Settings declaration.

Retained Hooks are analyzed after tree-shaking:

- `useSettings()` requires `settingsScope` and the `@deepseek-ai/dsh-client-ui-settings` Manifest edge.
- `useApi()` or `useQuery()` requires `connection` and the `@deepseek-ai/dsh-client-connection` edge.

### Settings

Share one `defineSettings()` contract. Register it once in `defineHost({ settings: [...] })`. Use `contract.host({ base, validate, setup })` only for Host-only behavior. A schema containing `role('secret')` requires a Client decoder that removes readable secret values; mutation types may still allow write-only fields.

### Typed API

Define unary methods once, implement every method with `contract.host()`, and call them from React with `useApi()` or `useQuery()`. Treat authorization, revision fences, idempotency, and durable outcomes as Host responsibilities. Propagate `AbortSignal` where work can be cancelled.

### Conversation Components

Declare a non-empty `kind`, official Session event descriptors with at least one start role, deterministic `initial`, required `reduce` when updates exist, optional publication/location/view projection, and a Hook-capable React component. Add the returned contribution to `defineClient({ conversations: [...] })`; do not separately register its generated Definition or renderer.
