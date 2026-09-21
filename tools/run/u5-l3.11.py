scores = [72, 95, 60, 88]
print(sorted(scores))
print(scores)
scores.sort(reverse=True)
print(scores)
print(max(scores), min(scores), sum(scores) / len(scores))
names = ["bob", "Ali", "alex"]
print(sorted(names))
print(sorted(names, key=str.lower))
