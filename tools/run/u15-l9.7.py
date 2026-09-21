from dataclasses import dataclass
from enum import Enum
class Status(Enum):
    TODO = "todo"
    DOING = "doing"
    DONE = "done"
@dataclass
class Ticket:
    title: str
    status: Status = Status.TODO
    def advance(self):
        order = list(Status)
        i = order.index(self.status)
        if i < len(order) - 1:
            self.status = order[i + 1]
t = Ticket("تصليح الباج")
t.advance()
print(t)
t.advance()
t.advance()
match t.status:
    case Status.DONE:
        print("✅ خلصت")
    case _:
        print("لسه")
