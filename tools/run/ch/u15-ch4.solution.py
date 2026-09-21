from dataclasses import dataclass, field
from enum import Enum

class OrderStatus(Enum):
    NEW = "new"
    PAID = "paid"
    SHIPPED = "shipped"

@dataclass
class Item:
    name: str
    price: float
    qty: int = 1

@dataclass
class Order:
    customer: str
    items: list[Item] = field(default_factory=list)
    status: OrderStatus = OrderStatus.NEW

    @property
    def total(self):
        return sum(i.price * i.qty for i in self.items)

    def _require(self, expected, action):
        if self.status is not expected:
            raise ValueError(f"مينفعش {action} والطلب {self.status.value}")

    def add(self, item):
        self._require(OrderStatus.NEW, "تضيف بنود")
        self.items.append(item)

    def pay(self):
        self._require(OrderStatus.NEW, "تدفع")
        self.status = OrderStatus.PAID

    def ship(self):
        self._require(OrderStatus.PAID, "تشحن")
        self.status = OrderStatus.SHIPPED
