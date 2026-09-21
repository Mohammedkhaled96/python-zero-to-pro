def save_scores(path, scores):
    ordered = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    with open(path, "w", encoding="utf-8") as f:
        for name, score in ordered:
            f.write(f"{name},{score}\n")

def load_scores(path):
    result = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            name, score = line.split(",")
            result[name] = int(score)
    return result
