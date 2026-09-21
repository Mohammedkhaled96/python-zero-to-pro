from pathlib import Path
p = Path("reports") / "2025" / "sales.final.csv"
print(p.as_posix())
print(p.name)
print(p.stem)
print(p.suffix)
print(p.parent.as_posix())
print(p.parts)
print(p.with_suffix(".xlsx").name)
