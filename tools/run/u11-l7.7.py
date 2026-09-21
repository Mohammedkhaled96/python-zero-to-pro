gen = (n for n in range(3))
print(list(gen))
print(list(gen))
def chain(*iterables):
    for it in iterables:
        yield from it
print(list(chain([1, 2], "ab", range(3))))
