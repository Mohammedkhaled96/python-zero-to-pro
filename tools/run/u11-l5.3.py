def average(scores: list[float]) -> float:
    return sum(scores) / len(scores)
def find_user(users: dict[str, int], name: str) -> int | None:
    return users.get(name)
def split_name(full: str) -> tuple[str, str]:
    first, _, last = full.partition(" ")
    return first, last
print(average([90, 85.5, 70]))
print(find_user({"sara": 1}, "ali"))
print(split_name("سارة أحمد"))
