from collections import Counter
words = "بايثون لغة سهلة بايثون لغة قوية بايثون".split()
counts = Counter(words)
print(counts)
print(counts["بايثون"])
print(counts["جافا"])
print(counts.most_common(2))
print(Counter("mississippi").most_common(1))
