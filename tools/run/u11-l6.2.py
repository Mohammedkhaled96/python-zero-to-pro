students = [("سارة", 91), ("أحمد", 78), ("منى", 85)]
print(sorted(students, key=lambda s: s[1], reverse=True))
words = ["kiwi", "Banana", "apple", "fig"]
print(sorted(words))
print(sorted(words, key=str.lower))
print(sorted(words, key=lambda w: (-len(w), w.lower())))
