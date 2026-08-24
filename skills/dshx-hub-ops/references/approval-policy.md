# Approval pause and resume protocol

Approvals exist only for high-risk decisions the Agent may not make alone. They are not a generic exception queue and must not replace deterministic validation, normal catalog commits, metric writes, clear-policy hiding, report dismissal, or policy-bounded temporary restrictions. Missing research capability, incomplete metadata, unavailable media, a single invalid candidate, and ordinary source disagreement stay in the local exception archive; they do not justify an approval.

## Prepare evidence

Before `dshx-hub approvals create --input FILE`, include:

- the registered approval kind and effect kind shown by CLI help;
- target type and stable target ID;
- related catalog run, submission, appeal, report, or moderation action IDs;
- current source hash and the exact current target state;
- upstream URLs, immutable hashes, checker output, and the smallest sufficient evidence excerpt;
- proposed effect parameters, preconditions, policy version, risk, and a deterministic idempotency key;
- a short explanation of why deterministic policy cannot finish the branch.

Never submit arbitrary SQL, commands, webhook URLs, secrets, raw access tokens, or editable effect scripts. Do not weaken evidence to fit the desired outcome.

## Interpret states

- `pending`: report `awaiting_approval`, preserve artifacts, and use `approvals wait` or stop.
- `changes_requested`: obtain fresh facts, recheck the target and source hash, then use `approvals revise`. A revision is a full new immutable version.
- `approved` with `awaiting_agent`: use `approvals claim-effect --id APPROVAL_ID --run RUN_ID` when the approval is run-bound, execute only the returned registered task within that original run, then submit `effect-result` with the lease.
- `approved` with `succeeded`: continue the preserved run from its resume point.
- `rejected`, `expired`, or `superseded`: do not execute and do not create a replacement unless new source state creates a genuinely new request.
- `failed`: preserve the structured failure. Server effects may only be retried by an administrator; Agent effects require the state described by the API response.

## Idempotency and leases

Reuse the approval payload's ID and resume command. A repeated create with the same idempotency key must resolve to the existing request. Never change effect parameters outside `approvals revise`.

An Agent lease is short-lived and bound to the requesting token and original run. Do not share it or claim work for another run. If the process crashes, the same run may claim again after expiry. Repeating a succeeded result is safe; inventing a new result is not.

Every pause report must contain the approval ID, URL, status, version, expiry, evidence artifact path, related run, and exact next command.
