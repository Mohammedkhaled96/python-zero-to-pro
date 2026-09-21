import doctest
def average(numbers):
    """متوسّط قائمة أرقام.
    >>> average([2, 4, 6])
    4
    >>> average([1, 2])
    1.5
    """
    return sum(numbers) / len(numbers)
doctest.run_docstring_examples(average, {"average": average}, name="average")
