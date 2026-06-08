"""Bare except that returns None — caller has no way to know the operation failed."""


def charge_card(token: str, amount: int) -> bool:
    try:
        _do_charge(token, amount)
        return True
    except Exception:
        return False


def _do_charge(token: str, amount: int) -> None:
    raise RuntimeError("upstream timeout")
