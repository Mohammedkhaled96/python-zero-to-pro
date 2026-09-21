class Cart:
    def __init__(self, items=None):
        self.items = list(items or [])
    def __len__(self):
        return len(self.items)
    def __contains__(self, item):
        return item in self.items
    def __add__(self, other):
        return Cart(self.items + other.items)
    def __str__(self):
        return "سلة: " + "، ".join(self.items)
a = Cart(["عيش", "لبن"])
b = Cart(["شاي"])
both = a + b
print(both)
print(len(both), "شاي" in both, "بن" in both)
