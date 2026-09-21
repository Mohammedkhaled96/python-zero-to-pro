scores = {"سارة": 91, "علي": 78, "منى": 85}
by_score = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
print(by_score)
ranked = dict(by_score)
print(list(ranked))
print(max(scores, key=scores.get))
print(sorted(scores))
