def binary_search(items, target):
    """مكان target في القائمة المرتّبة items، أو -1"""
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        value = items[mid]
        if value == target:
            return mid
        if value < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
