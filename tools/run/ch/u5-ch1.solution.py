scores = [70, 95, 40, 88, 60]
top3 = sorted(scores, reverse=True)[:3]
spread = max(scores) - min(scores)
average = round(sum(scores) / len(scores), 1)
