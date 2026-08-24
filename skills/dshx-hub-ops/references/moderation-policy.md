# Automated moderation policy

Policy version: `dshx-community-1`.

Always read the full `dshx-hub moderation queue` target, author, plugin, grouped reports, and recent restriction history. Every action must carry all related report IDs, a decision code, confidence, policy version, and a short evidence summary in the reason or metadata.

## Clear violations

Automatic hiding requires confidence of at least `0.95` and direct evidence of one of:

- phishing or credential theft;
- malware distribution or instructions intended to compromise users;
- exposed secrets or doxxing;
- an explicit credible threat or explicit hateful attack;
- repeated substantially identical promotional spam.

Use `moderation hide` for the review or reply. Do not infer intent from a package name, political opinion, profanity alone, criticism, satire, quotation, or ambiguous language.

For phishing, malware, doxxing, or explicit threats, a first clear violation also receives a seven-day write restriction. For other clear violations, count confirmed violations in the preceding 30 days: the second receives 24 hours and the third or later receives seven days. Record the content decision and user restriction as separate audited actions sharing the same evidence and report IDs where applicable.

## Dismissal

Use `moderation dismiss` when evidence is ambiguous, satirical, unverifiable, unrelated to the reported target, merely unpopular, or below the clear-violation threshold. Dismissal resolves the reports without changing content state.

If the target cannot be inspected because required data is missing or a global service failed, stop and leave it open. Otherwise, ambiguous or insufficient evidence is dismissed rather than hidden.

## Forbidden automation

Never automatically permanently ban, restore hidden content, unban, revoke a restriction early, or change a user role. If such an action is required, use the CLI command that creates its registered approval, record all report IDs and source state, then follow `approval-policy.md`. Do not call a lower-level action to bypass approval.

After actions, fetch the queue again to confirm reports were atomically resolved or dismissed and ensure the audit result has no critical community inconsistency.
