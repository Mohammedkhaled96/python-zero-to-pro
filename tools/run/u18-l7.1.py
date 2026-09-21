print([name for name in dir(str) if not name.startswith("_")][:8])
print(str.center.__doc__)
import inspect
print(inspect.signature(sorted))
import random
print(inspect.signature(random.randint))
