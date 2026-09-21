import json
scores = {"سارة": 920, "علي": 780, "منى": 990, "عمر": 640}
top = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:3]
board = [{"rank": i, "name": n, "score": s} for i, (n, s) in enumerate(top, 1)]
with open("leaderboard.json", "w", encoding="utf-8") as f:
    json.dump(board, f, ensure_ascii=False, indent=2)
with open("leaderboard.json", encoding="utf-8") as f:
    for row in json.load(f):
        print(f"{row['rank']}. {row['name']} — {row['score']}")
