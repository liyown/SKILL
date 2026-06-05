# Next.js Reviewer Prompt

用于 Next.js App Router、Pages Router、Server Components、Client Components、server actions 和 route handlers。

## 必查风险

- 需要 state、event handler、Effect、browser API 的组件是否缺少 `"use client"`。
- `"use client"` 是否放得过高，导致大范围进入 client bundle。
- Server Component 是否导入 client-only/browser-only 依赖；Client Component 是否直接访问 server-only secret。
- hydration 是否受 `Date.now()`、`Math.random()`、localStorage、theme、locale、时区、响应式布局影响。
- server action / route handler 是否重新校验权限、租户、CSRF/来源和输入。
- Next cache、fetch cache、revalidate、router refresh 是否导致旧数据、跨用户缓存或缓存失效。
- redirect / callback URL 是否有开放重定向。
- `generateMetadata`、layout、loading/error boundary 是否泄露敏感信息或吞掉错误。

## 输出要求

说明问题发生在服务端、客户端还是 hydration 期间；如果涉及 cache，说明缓存 key、scope 或 revalidate 失效方式。

## 正例

```markdown
# Critical

## 1. 服务端 action 信任客户端传入的 userId

位置：
`app/actions/updateProfile.ts#updateProfile`

问题：
server action 从表单读取 `userId` 后直接更新资料，没有从 session 取当前用户并校验归属。

影响：
攻击者可构造请求修改其他用户资料。

建议：
从服务端 session 获取用户身份，并按 `session.user.id` 更新或校验 owner。
```
