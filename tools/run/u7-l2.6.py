import random
dice = random.randint(1, 6)
print(1 <= dice <= 6)
colors = ["أحمر", "أخضر", "أزرق"]
print(random.choice(colors) in colors)
deck = list(range(1, 11))
random.shuffle(deck)
print(sorted(deck) == list(range(1, 11)), len(deck))
print(len(set(random.sample(deck, 3))))
random.seed(42)
first = [random.randint(1, 6) for _ in range(5)]
random.seed(42)
second = [random.randint(1, 6) for _ in range(5)]
print(first == second)
