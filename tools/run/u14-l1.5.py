import importlib.util
for name in ["json", "not_a_real_package_xyz"]:
    found = importlib.util.find_spec(name) is not None
    print(name, "موجودة" if found else "مش متسطّبة")
