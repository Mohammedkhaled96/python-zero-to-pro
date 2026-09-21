def leaf(name, size):
    return {"name": name, "size": size, "children": []}

def test_leaf():
    "فولدر من غير أبناء ← حجمه"
    assert total_size(leaf("a", 7)) == 7

def test_one_level():
    "مستوى واحد"
    root = {"name": "r", "size": 1, "children": [leaf("a", 2), leaf("b", 3)]}
    assert total_size(root) == 6

def test_nested():
    "مستويات متداخلة"
    root = {"name": "r", "size": 1, "children": [
        {"name": "x", "size": 2, "children": [leaf("y", 3), {"name": "z", "size": 4, "children": [leaf("w", 5)]}]},
        leaf("v", 6),
    ]}
    assert total_size(root) == 21, total_size(root)

def test_deep():
    "عمق 200 مستوى"
    node = leaf("bottom", 1)
    for i in range(200):
        node = {"name": str(i), "size": 1, "children": [node]}
    assert total_size(node) == 201
