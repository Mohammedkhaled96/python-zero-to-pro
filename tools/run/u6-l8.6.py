nums = [4, -2, 0, 7, -9]
print(sum(n * n for n in nums))
print(any(n < 0 for n in nums))
print(all(n != 0 for n in nums))
print(max(nums, key=abs))
words = ["python", "is", "awesome"]
print(max(words, key=len))
print(sum(1 for w in words if len(w) > 2))
