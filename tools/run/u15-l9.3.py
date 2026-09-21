from dataclasses import dataclass, field
@dataclass
class Product:
    name: str
    price: float
    tags: list[str] = field(default_factory=list)
    qty: int = 0
    def __post_init__(self):
        if self.price < 0:
            raise ValueError("السعر ما ينفعش يكون سالب")
        self.name = self.name.strip().title()
    @property
    def total(self):
        return self.price * self.qty
p = Product("  laptop ", 25000, qty=2)
print(p)
print(p.total)
p.tags.append("tech")
print(Product("mouse", 300).tags)
try:
    Product("x", -1)
except ValueError as e:
    print(e)
