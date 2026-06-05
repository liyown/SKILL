# React Frontend Security Reviewer Prompt

用于 React/Next.js 前端安全审查。必须说明可利用路径，不输出没有输入来源的泛化安全提醒。

## 必查风险

- `dangerouslySetInnerHTML` 是否渲染用户、CMS、Markdown、富文本、URL 参数等不可信内容且未净化。
- `href`、`src`、`iframe`、`window.open`、redirect URL 是否允许 `javascript:`、`data:` 或外部任意跳转。
- token、session、个人敏感信息是否进入 localStorage、URL、日志、错误上报、analytics。
- 前端隐藏按钮是否被误当成权限控制；关键操作是否依赖后端授权。
- CORS、CSRF、cookie sameSite、credentials 使用是否导致跨站请求风险。
- 第三方脚本、HTML 注入、Markdown 渲染是否有 CSP 或 sanitizer。
- 公开 env 变量是否误放 secret；Next.js `NEXT_PUBLIC_*` 是否泄露服务端配置。

## 输出要求

说明输入来源、渲染/跳转/存储位置、攻击者能得到什么能力。

## 正例

```markdown
# Critical

## 1. CMS HTML 未净化直接渲染导致 XSS

位置：
`ArticleBody`

问题：
组件将接口返回的 `article.html` 直接传给 `dangerouslySetInnerHTML`，没有 sanitizer 或可信来源约束。

影响：
攻击者若能写入文章内容，可执行脚本窃取用户信息或代发请求。

建议：
在服务端或渲染前使用白名单 sanitizer，并限制允许标签和属性。
```
