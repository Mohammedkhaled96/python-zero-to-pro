import pytest
def discount(price, percent):
    if not 0 <= percent <= 100:
        raise ValueError("النسبة لازم بين 0 و 100")
    return price * (100 - percent) / 100
def test_normal():
    assert discount(200, 25) == 150
def test_zero():
    assert discount(99, 0) == 99
def test_invalid():
    with pytest.raises(ValueError):
        discount(100, 150)
for t in [test_normal, test_zero, test_invalid]:
    t()
    print("PASSED", t.__name__)
