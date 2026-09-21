def insertion_sort(items):
    items = items[:]
    for i in range(1, len(items)):
        current = items[i]
        j = i - 1
        while j >= 0 and items[j] > current:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = current
    return items
nums = [5, 2, 9, 1, 5]
print(insertion_sort(nums), insertion_sort(nums) == sorted(nums))
students = [("منى", 90), ("علي", 85), ("سارة", 90)]
print(sorted(students, key=lambda s: (-s[1], s[0])))
