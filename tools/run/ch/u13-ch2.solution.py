BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}

def winner(p1, p2):
    if p1 not in BEATS or p2 not in BEATS:
        raise ValueError(f"حركة غير معروفة: {p1!r} / {p2!r}")
    if p1 == p2:
        return "draw"
    return "p1" if BEATS[p1] == p2 else "p2"
