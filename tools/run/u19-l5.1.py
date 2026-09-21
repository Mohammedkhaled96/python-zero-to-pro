import numpy as np
prices = np.array([120, 85, 240, 60])
print(prices * 1.14)
print(prices.mean(), prices.max())
print(prices[prices > 100])
