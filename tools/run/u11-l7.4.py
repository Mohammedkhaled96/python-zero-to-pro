import sys
squares_list = [n * n for n in range(1_000_000)]
squares_gen = (n * n for n in range(1_000_000))
print(f"القائمة: {sys.getsizeof(squares_list) // 1024:,} KB")
print(f"المولّد: {sys.getsizeof(squares_gen)} bytes")
print(sum(squares_gen))
