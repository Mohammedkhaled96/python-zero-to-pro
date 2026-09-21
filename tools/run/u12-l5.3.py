from pathlib import Path
base = Path("project")
for name in ["main.py", "utils.py", "data/a.csv", "data/b.csv", "data/old/c.csv", "README.md"]:
    f = base / name
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text("x", encoding="utf-8")
print(sorted(p.name for p in base.glob("*.py")))
print(sorted(p.name for p in base.glob("data/*.csv")))
print(sorted(p.as_posix() for p in base.rglob("*.csv")))
