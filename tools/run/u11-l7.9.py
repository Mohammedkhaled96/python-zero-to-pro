def chunks(items, size):
    for start in range(0, len(items), size):
        yield items[start:start + size]
for batch in chunks(list(range(1, 11)), 4):
    print(batch)
