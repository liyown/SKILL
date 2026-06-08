"""
Good counterpart of swallow-exception.py.
"""


class PaymentError(RuntimeError):
    pass


class OrderProcessingError(RuntimeError):
    pass


def charge_card(token: str, amount: int) -> bool:
    try:
        _do_charge(token, amount)
        return True
    # Fix 1 (narrow catch): catch only the specific exception type
    # the upstream is documented to raise. The bad version's bare
    # `except Exception` swallowed every error including programmer
    # mistakes.
    except PaymentError as e:
        # Fix 2 (raise X from Y): re-raise as the domain error with
        # `from e` so the original cause is preserved in the
        # traceback. Callers see both `OrderProcessingError` and the
        # underlying `PaymentError`.
        raise OrderProcessingError("charge failed") from e


def _do_charge(token: str, amount: int) -> None:
    raise PaymentError("upstream timeout")
