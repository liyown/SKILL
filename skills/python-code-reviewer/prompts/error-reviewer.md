# Python Error Handling Reviewer Prompt

> See also: prompts/async-reviewer.md, web-reviewer.md, sql-reviewer.md


For exception types, `raise from`, swallowed exceptions, logging, context managers, and `__exit__` error handling.

## Required Checks

- Empty `except:` catches `BaseException` and swallows `KeyboardInterrupt` / `SystemExit`.
- `except Exception:` is too broad and hides specific errors; should catch a specific type or a custom exception family.
- Caught then only `print` / `pass` / `logger.exception`, never re-raised; the caller does not know it failed.
- `raise X` without `from Y` loses the original stack; `raise X from None` deliberately suppresses the chain but should be commented.
- `return` inside `finally` swallows the exception from `try`, making the bug hard to find.
- A custom exception does not inherit from `Exception`, does not carry a `status_code` / business code, or has incomplete `args`.
- Context manager `__exit__` returns `True` and swallows the exception; without `return` the exception propagates.
- `logger.exception` must be called inside the `except` block to capture the traceback; `logger.error` + `exc_info=True` is an alternative.
- `tenacity` / `backoff` retry decorators do not restrict the retry exception type (e.g. `requests.exceptions.RequestException` rather than `Exception`), so they retry `KeyboardInterrupt` too.
- `assert` is used for production validation; it is stripped under `-O` and should not gate input validity.
- `except CancelledError` in async code does not re-raise, breaking cancellation semantics.

## Output Requirements

Explain how the error is swallowed, how the caller misjudges, and the eventual production behaviour. Give a minimal try/except fix.

## Positive Example

```markdown
# High

## 1. `except Exception` silently swallows the error, upstream gets 200

Location:
`order.handler.process`

Problem:
```python
try:
    charge_card(token, amount)
except Exception:
    pass
return {"ok": True}
```
Catches then `pass` and returns ok; the caller has no idea it failed.

Impact:
Double charges, missing entries, mismatched reconciliation.

Suggestion:
Catch a specific `PaymentError` and re-raise as the domain error: `except PaymentError as e: raise OrderProcessingError("charge failed") from e`.
```
