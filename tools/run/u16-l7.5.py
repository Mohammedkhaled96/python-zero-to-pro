from unittest.mock import patch, Mock
def fetch_rate():
    from urllib.request import urlopen
    with urlopen("https://api.example.com/usd", timeout=10) as r:
        return float(r.read())
def price_in_egp(usd):
    return round(usd * fetch_rate(), 2)
with patch.dict(globals(), {"fetch_rate": lambda: 50.0}):
    print(price_in_egp(3))
fake = Mock(return_value=48.5)
with patch.dict(globals(), {"fetch_rate": fake}):
    price_in_egp(2)
    price_in_egp(4)
print(fake.call_count)
