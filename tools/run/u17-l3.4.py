import bisect
def first_index(items, target):
    low, high = 0, len(items) - 1
    answer = -1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            answer = mid
            high = mid - 1
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return answer
data = [1, 3, 3, 3, 5, 8, 8, 9]
print(first_index(data, 3), first_index(data, 8), first_index(data, 4))
print(bisect.bisect_left(data, 3), bisect.bisect_left(data, 8))
