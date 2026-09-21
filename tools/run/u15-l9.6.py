from enum import Enum, auto
class Status(Enum):
    TODO = "todo"
    DOING = "doing"
    DONE = "done"
s = Status.DOING
print(s, s.name, s.value)
print(s is Status.DOING)
print(Status("done"))
print([m.value for m in Status])
try:
    Status("finished")
except ValueError as e:
    print(e)
class Priority(Enum):
    LOW = auto()
    HIGH = auto()
print(Priority.HIGH.value)
