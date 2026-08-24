# Exception and recovery policy

Append exceptions locally with a stable candidate identity when known, stage, code, evidence paths, retryability, last attempt, and next useful action.

## Classification

- `candidate_invalid`: deterministic evidence proves the candidate cannot publish; do not retry without a changed artifact.
- `insufficient_evidence`: required facts are absent; try an authoritative alternate source, then defer.
- `identity_conflict`: authoritative sources disagree; isolate and never guess.
- `source_unavailable`: one external source failed; try alternatives and do not count it as a target failure.
- `capability_missing`: the current Agent cannot obtain or inspect required material; report the skipped branch without fabricating results.
- `hub_unavailable`, `auth_failed`, or `contract_mismatch`: stop all Hub writes and preserve state.
- `atomic_effect_failed`: public state should be unchanged; preserve the run and exact retry command.
- `awaiting_approval`: successful pause for a registered high-risk decision, not a failed operation.

Retry only when evidence, capability, or external state has changed, or when the error explicitly marks itself retryable. Do not repeatedly research terminal invalid candidates each day. Revisit retryable exceptions before new discovery.

Ordinary missing data, invalid packages, weak content, unclear media rights, and missing tools are not approvals. Use `ops_exception` only when a high-risk operational decision genuinely requires an administrator and the registered effect can safely continue the original workflow.
