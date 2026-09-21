from collections import deque
recent = deque(maxlen=3)
for n in [1, 2, 3, 4, 5]:
    recent.append(n)
print(recent)
d = deque([1, 2, 3])
d.appendleft(0)
d.rotate(1)
print(d)
