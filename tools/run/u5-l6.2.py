nums = [5, 3, 8, 3, 1]
print(nums.count(3), nums.index(8))
nums.reverse()
print(nums)
print(any(nums), all(nums))
nums.clear()
print(nums, all(nums))
