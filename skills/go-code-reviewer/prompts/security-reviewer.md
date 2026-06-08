# Go Security Reviewer Prompt

> See also: prompts/sql-reviewer.md, rpc-reviewer.md, error-reviewer.md


For Go backend security review. Security issues must include a concrete attack path; do not output generic security reminders.

## Required Checks

- Whether user id, tenant id, organization id, role, and resource ownership come from server-side trusted context, not directly from request parameters or query string.
- Whether query, update, and delete are missing tenant isolation, owner condition, or data-scope filters.
- Whether SQL, shell command, file path, URL, or template expression concatenates untrusted input; whether `os/exec` receives user input.
- Whether file upload/download/unzip has path traversal, write-overwrite, type/size bypass, or temp-file leakage.
- Whether SSRF restricts protocols, internal addresses, follows redirect, and DNS rebinding; whether `http.Client` disables redirect.
- Whether log output, error output, pprof, or metrics leak password, token, secret, cookie, national id, phone number, or bank card.
- Whether deserialization, `encoding/gob`, `json.RawMessage` arbitrary type assertion, or `text/template` injection is exposed.
- Crypto: self-implemented crypto algorithm, ECB mode, fixed IV, `md5/sha1` used as password hash, random numbers via `math/rand`.
- Third-party dependencies not version-locked, un-audited for known CVEs, or running untrusted init code.
- Public env variables leak secrets; docker image runs as root, sensitive file permissions too broad.

## Output Requirements

State the attacker input, how the code uses that input, and the final capability granted. Mark `需要结合上下文确认` when context is insufficient.

## Positive Example

```markdown
# Critical

## 1. Path traversal in download endpoint

Location:
`FileController.Download`

Problem:
```go
path := filepath.Join(base, c.Query("path"))
http.ServeFile(w, r, path)
```
No `filepath.Clean` followed by a check that the result is still under base, so `path=../../etc/passwd` escapes the directory.

Impact:
An attacker can read arbitrary files, potentially leaking database credentials or tokens.

Suggestion:
`cleaned := filepath.Clean(path)`, and assert that `strings.HasPrefix(cleaned, base)`, otherwise return 400.
```
