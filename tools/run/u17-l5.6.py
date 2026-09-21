from collections import deque
def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack
for t in ["(a[b]{c})", "(]", "((x)"]:
    print(t, balanced(t))
printer = deque(["تقرير", "فاتورة"])
printer.append("صورة")
while printer:
    print("طباعة:", printer.popleft())
