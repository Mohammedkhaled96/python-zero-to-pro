def test_all_combinations():
    "كل التوافيق التسعة"
    table = {
        ("rock", "scissors"): "p1", ("scissors", "paper"): "p1", ("paper", "rock"): "p1",
        ("scissors", "rock"): "p2", ("paper", "scissors"): "p2", ("rock", "paper"): "p2",
        ("rock", "rock"): "draw", ("paper", "paper"): "draw", ("scissors", "scissors"): "draw",
    }
    for (a, b), expected in table.items():
        got = winner(a, b)
        assert got == expected, f"winner({a!r}, {b!r}) رجّعت {got!r} والمفروض {expected!r}"

def test_invalid():
    "حركة غلط ← ValueError"
    for a, b in [("rock", "lizard"), ("stone", "paper")]:
        try:
            winner(a, b)
        except ValueError:
            continue
        raise AssertionError(f"winner({a!r}, {b!r}) ما رمتش ValueError")
