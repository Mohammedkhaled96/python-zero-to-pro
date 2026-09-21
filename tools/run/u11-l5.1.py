def greet(name: str, times: int = 1) -> str:
    return ("أهلًا " + name + " ") * times
print(greet("سارة", 2))
print(greet.__annotations__)
