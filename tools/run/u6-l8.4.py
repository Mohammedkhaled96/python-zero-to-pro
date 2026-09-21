nums = [4, -2, 0, 7, -9]
evens = [n for n in nums if n % 2 == 0]
abs_vals = [n if n >= 0 else -n for n in nums]
labels = ["زوجي" if n % 2 == 0 else "فردي" for n in nums]
positive_doubled = [n * 2 for n in nums if n > 0]
print(evens)
print(abs_vals)
print(labels)
print(positive_doubled)
