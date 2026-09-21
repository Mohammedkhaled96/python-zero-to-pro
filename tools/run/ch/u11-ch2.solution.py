def apply_discount(price, percent=10, *, min_price=0):
    if not 0 <= percent <= 100:
        raise ValueError(f"نسبة غير صالحة: {percent}")
    result = round(price * (1 - percent / 100), 2)
    return max(result, min_price)
