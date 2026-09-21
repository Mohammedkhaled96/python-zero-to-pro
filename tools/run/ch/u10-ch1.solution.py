sentence = input("الجملة: ")
counts = {}
for word in sentence.lower().split():
    counts[word] = counts.get(word, 0) + 1
best, best_n = "", 0
for word, n in counts.items():
    if n > best_n:
        best, best_n = word, n
print(f"الأكثر تكرارًا: {best} ({best_n})")
