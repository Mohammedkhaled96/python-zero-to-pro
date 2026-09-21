from dataclasses import dataclass, asdict, astuple, replace
@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int
    patch: int = 0
v1 = Version(3, 12, 1)
v2 = Version(3, 9)
print(v1 > v2)
print(sorted([v1, v2, Version(3, 12)]))
print(asdict(v1))
print(astuple(v1))
print(replace(v1, patch=2))
try:
    v1.major = 4
except Exception as e:
    print(type(e).__name__)
print({v1: "current"}[Version(3, 12, 1)])
