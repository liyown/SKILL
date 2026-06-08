# Python Security Reviewer Prompt

> See also: prompts/sql-reviewer.md, web-reviewer.md, error-reviewer.md


For Python backend security review. Each finding must include an attack path; do not output generic reminders.

## Required Checks

- `pickle.loads` / `cPickle.loads` / `shelve` accepting untrusted input — deserialization runs arbitrary code.
- `yaml.load` (non-`SafeLoader`) accepting untrusted input — same as above.
- `subprocess` / `os.system` / `os.popen` with `shell=True` and string concatenation — command injection.
- `eval` / `exec` / `compile` accepting untrusted input — arbitrary code execution.
- `format` / f-string used for SQL, log, shell concatenation — injection / log injection.
- `requests` / `httpx` / `urllib` follow untrusted redirect, no timeout, internal network allowed — SSRF.
- `django.conf.settings` / `os.environ` read secrets and write them to logs, without masking token / national id / phone number.
- Template injection: `render_template_string(user_input)`, `jinja2` sandbox bypass.
- `flask.session` is client-readable by default; storing sensitive data should use server-side session + signing.
- File operations: `open(filename)` accepting user input without normalize — path traversal.
- `cryptography` / `hashlib` self-implemented protocol; `md5` / `sha1` as password hash; random via `random` instead of `secrets`.
- `pip install -r requirements.txt` with no version lock, un-audited for known CVEs.
- CORS `allow_origins=["*"]` + `allow_credentials=True` — CSRF risk.

## Output Requirements

State the attacker input, how the code uses that input, and the final capability granted. Mark `需要结合上下文确认` when context is insufficient.

## Positive Example

```markdown
# Critical

## 1. `pickle.loads` on user upload leads to arbitrary code execution

Location:
`report.api.upload`

Problem:
```python
data = pickle.loads(request.body)
```
`pickle.loads` runs arbitrary code on deserialization.

Impact:
An attacker who can upload a malicious pickle file can execute arbitrary commands on the server.

Suggestion:
Switch to JSON / MessagePack / protobuf; if pickle is unavoidable, restrict its source to a trusted internal queue.
```
