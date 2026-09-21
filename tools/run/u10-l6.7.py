from collections import Counter
text = "Python is Powerful and Popular"
counts = Counter(text.lower().replace(" ", ""))
for letter, n in counts.most_common(3):
    print(letter, n)
