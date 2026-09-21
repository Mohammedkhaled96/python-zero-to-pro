import math
from collections import Counter
data = [
    ((150, 9), "تفاحة"), ((170, 8), "تفاحة"), ((140, 9), "تفاحة"),
    ((130, 3), "برتقالة"), ((120, 2), "برتقالة"), ((160, 4), "برتقالة"),
]
def predict(sample, k=3):
    nearest = sorted(data, key=lambda item: math.dist(sample, item[0]))[:k]
    votes = Counter(label for _, label in nearest)
    return votes.most_common(1)[0][0]
print(predict((155, 7)))
print(predict((125, 3)))
