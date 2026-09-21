words = ["hi", "python", "is", "great"]
long_words = []
for w in words:
    if len(w) > 3:
        long_words.append(w.upper())
print(long_words)
print([w.upper() for w in words if len(w) > 3])
