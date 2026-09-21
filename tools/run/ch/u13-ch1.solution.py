def mask(word, guessed):
    lowered = {g.lower() for g in guessed}
    return " ".join(ch if ch.lower() in lowered else "_" for ch in word)

def is_won(word, guessed):
    lowered = {g.lower() for g in guessed}
    return set(word.lower()) <= lowered
