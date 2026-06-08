# Node Security Reviewer Prompt

> See also: prompts/sql-reviewer.md, http-reviewer.md, error-reviewer.md


For Node backend security review. Each finding must include an attack path; do not output generic reminders.

## Required Checks

- Prototype pollution: `Object.assign(target, JSON.parse(input))`, `_.merge(target, input)`, `{ ...target, ...input }` where the key is `__proto__` / `constructor.prototype`.
- `node-serialize` / `serialize-javascript` deserializes into arbitrary code execution.
- `eval` / `Function` constructor / `vm.runInThisContext` accept untrusted input.
- SQL / NoSQL injection: `prisma.$queryRaw\`...\`` concatenation, `{ where: req.body }` directly passed to MongoDB, `{ [req.query.field]: value }`.
- Template string SQL/shell concatenation: `pool.query(\`SELECT ... WHERE id = ${id}\`)` is injection.
- `child_process.exec` accepts user input; `exec` / `spawn` with `shell: true` and string concatenation.
- File operations: `fs.readFile(path)` accepting user input without normalize — path traversal.
- `jwt.verify(token, secret, { algorithms: ['none'] })` allows `alg: none`; weak secret; missing `algorithm` enabling `alg` confusion.
- `crypto` uses `createCipher` (deprecated) instead of `createCipheriv`; fixed IV; self-implemented protocol.
- `randomUUID` is the only one; `Math.random` for token / session id is insecure.
- Public env leaks secrets; `.env` in repo.
- CORS `origin: '*'` + `credentials: true` — browser actually rejects but can be bypassed.
- Third-party packages not version-locked, un-audited for known CVEs; lockfile and package.json inconsistent.

## Output Requirements

State the attacker input, how the code uses that input, and the final capability granted. Mark `需要结合上下文确认` when context is insufficient.

## Positive Example

```markdown
# Critical

## 1. `Object.assign` + `JSON.parse` leads to prototype pollution

Location:
`config.loader`

Problem:
```ts
const defaults = {};
const user = JSON.parse(input);
const merged = Object.assign(defaults, user);
return defaults;
```
Attacker passes `{"__proto__":{"isAdmin":true}}`; `Object.assign` writes `__proto__` to the target's prototype.

Impact:
Every object inherits `isAdmin=true`; later `if (user.isAdmin)` mistakenly grants admin, leading to authorization bypass.

Suggestion:
Reject `__proto__`, `constructor`, `prototype` keys; use `Object.create(null)` as the target; or use `Object.defineProperty` to define attributes explicitly.
```
