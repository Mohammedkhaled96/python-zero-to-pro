def winner(p1, p2):
    if p1 == p2:
        return "draw"
    if p1 == "rock" and p2 == "scissors":
        return "p1"
    return "p2"
