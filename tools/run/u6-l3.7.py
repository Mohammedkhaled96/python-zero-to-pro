nums = [4, 9, 2]
for i in range(len(nums)):
    nums[i] = nums[i] * 2
print(nums)
best = 0
for i in range(len(nums)):
    if nums[i] > nums[best]:
        best = i
print("أكبر رقم في المكان", best)
