# Critical

## 1. 富文本字段未净化直接渲染导致 XSS

位置：
`UserTable`

问题：
组件把 `row.nameHtml` 直接传入 `dangerouslySetInnerHTML`。该字段来自 `/api/users` 响应，当前代码没有 sanitizer 或可信来源校验。

影响：
攻击者若能控制该字段，可在用户浏览页面时执行脚本，窃取信息或代发请求。

建议：
不要渲染 HTML；如业务必须渲染富文本，使用白名单 sanitizer 并限制允许标签和属性。

# High

## 1. useEffect 依赖缺失导致筛选条件变化后数据不更新

位置：
`UserTable#useEffect`

问题：
effect 使用了 `query`，但依赖数组为空。组件首次加载后 query 变化不会重新请求。

影响：
页面展示的用户列表和当前查询条件不一致，可能导致误操作。

建议：
把 `query` 放入依赖数组，并使用 `AbortController` 避免旧请求覆盖新结果。
