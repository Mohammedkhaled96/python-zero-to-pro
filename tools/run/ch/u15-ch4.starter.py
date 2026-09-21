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
    # كمّل الحقول والدوال
