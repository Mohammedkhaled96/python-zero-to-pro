def stripped(lines):
    for line in lines:
        yield line.strip()
def non_empty(lines):
    for line in lines:
        if line:
            yield line
def upper(lines):
    for line in lines:
        yield line.upper()
raw = ["  hello ", "", "world  ", "   ", "python"]
pipeline = upper(non_empty(stripped(raw)))
print(list(pipeline))
