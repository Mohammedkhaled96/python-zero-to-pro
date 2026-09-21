def binary_search(items, target):
    """مكان target في القائمة المرتّبة items، أو -1"""
    for i, value in enumerate(items):
        if value == target:
            return i
    return -1
