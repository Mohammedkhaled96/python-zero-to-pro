nums = [3, 1, 2]
print(nums)
print(*nums)
print(*nums, sep=" | ")
more = [*nums, 4, *range(5, 7)]
print(more)
letters = [*"abc"]
print(letters)
unique = {*nums, *[2, 3, 9]}
print(sorted(unique))
