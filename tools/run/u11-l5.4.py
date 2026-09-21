from typing import Callable, Any
count: int = 0
names: list[str] = []
def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)
def show(item: Any) -> None:
    print(f"[{item}]")
print(apply(abs, -7))
show(3.5)
