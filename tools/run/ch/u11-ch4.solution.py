def chunks(items, size):
    if size < 1:
        raise ValueError("size لازم يكون 1 أو أكتر")
    for start in range(0, len(items), size):
        yield items[start:start + size]
