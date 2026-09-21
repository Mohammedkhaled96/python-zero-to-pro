def average(numbers: list[float]) -> float | None:
    """بترجّع المتوسّط، أو None لو مفيش أرقام."""
    if not numbers:
        return None
    return sum(numbers) / len(numbers)
print(average([10, 20, 30]))
print(average([]))
print(average("abc") if False else "مش هنشغّلها")
print(average.__annotations__)
def tag(text: str, times: int = 1) -> str:
    return (text + " ") * times
print(tag("بايثون", 3).strip())
