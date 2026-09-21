FRUITS = [((150, 9), "تفاحة"), ((170, 8), "تفاحة"), ((140, 9), "تفاحة"),
          ((130, 3), "برتقالة"), ((120, 2), "برتقالة"), ((160, 4), "برتقالة")]

def test_lesson_examples():
    "(155, 7) ← تفاحة و (125, 3) ← برتقالة"
    assert knn_predict(FRUITS, (155, 7)) == "تفاحة"
    assert knn_predict(FRUITS, (125, 3)) == "برتقالة"

def test_k1():
    "k = 1 ← أقرب جار بس"
    assert knn_predict(FRUITS, (158, 5), k=1) == "برتقالة"

def test_three_features():
    "3 خصائص"
    data = [((0, 0, 0), "a"), ((0, 0, 1), "a"), ((9, 9, 9), "b"), ((9, 9, 8), "b"), ((8, 9, 9), "b")]
    assert knn_predict(data, (1, 0, 0), k=3) == "a"
    assert knn_predict(data, (9, 8, 9), k=3) == "b"

def test_bad_k():
    "k = 0 أو أكبر من البيانات ← ValueError"
    for k in (0, 7):
        try:
            knn_predict(FRUITS, (1, 1), k=k)
        except ValueError:
            continue
        raise AssertionError(f"k={k} ما رمتش ValueError")
