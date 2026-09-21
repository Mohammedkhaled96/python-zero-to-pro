from collections import defaultdict
words = ["apple", "banana", "avocado", "blueberry", "cherry"]
index = defaultdict(list)
for w in words:
    index[w[0]].append(w)
print(dict(index))
