import math
from collections import Counter
data = [((150, 9), "تفاحة"), ((170, 8), "تفاحة"), ((140, 9), "تفاحة"),
        ((130, 3), "برتقالة"), ((120, 2), "برتقالة"), ((160, 4), "برتقالة")]
def predict(sample, k):
    nearest = sorted(data, key=lambda item: math.dist(sample, item[0]))[:k]
    return Counter(label for _, label in nearest).most_common(1)[0][0]
for k in [1, 3, 5]:
    print(k, predict((158, 5), k))
