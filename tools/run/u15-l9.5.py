import json
from dataclasses import dataclass, asdict
@dataclass
class Task:
    title: str
    done: bool = False
tasks = [Task("مذاكرة"), Task("رياضة", True)]
text = json.dumps([asdict(t) for t in tasks], ensure_ascii=False)
print(text)
loaded = [Task(**d) for d in json.loads(text)]
print(loaded)
print(loaded == tasks)
