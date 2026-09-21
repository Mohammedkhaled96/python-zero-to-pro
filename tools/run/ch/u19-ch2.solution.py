import math
from collections import Counter

def knn_predict(data, sample, k=3):
    if not 1 <= k <= len(data):
        raise ValueError(f"k لازم يكون بين 1 و {len(data)}")
    nearest = sorted(data, key=lambda item: math.dist(sample, item[0]))[:k]
    votes = Counter(label for _, label in nearest)
    return votes.most_common(1)[0][0]
