text = "بايثون سهلة و بايثون قوية و بايثون ممتعة"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
top = sorted(counts.items(), key=lambda pair: pair[1], reverse=True)
for word, n in top[:2]:
    print(word, n)
once = [w for w, n in counts.items() if n == 1]
print(once)
