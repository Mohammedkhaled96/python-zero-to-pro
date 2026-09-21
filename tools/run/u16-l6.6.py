import doctest
def initials(name):
    """ترجّع الحروف الأولى بحروف كبيرة.
    >>> initials("ada lovelace")
    'AL'
    >>> initials("  guido   van rossum ")
    'GVR'
    >>> initials("")
    ''
    """
    return "".join(part[0].upper() for part in name.split())
runner = doctest.DocTestRunner()
for test in doctest.DocTestFinder().find(initials, "initials", module=False, globs={"initials": initials}):
    runner.run(test)
print(runner.summarize(verbose=False))
