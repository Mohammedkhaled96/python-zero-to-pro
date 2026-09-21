import json
from pathlib import Path
settings = {"theme": "dark", "font_size": 14, "recent": ["notes.txt", "todo.md"]}
with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, ensure_ascii=False, indent=2)
with open("settings.json", encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded["recent"][0])
print(Path("settings.json").read_text(encoding="utf-8"))
