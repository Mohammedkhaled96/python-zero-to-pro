def home():
    return "<h1>الرئيسية</h1>"
def about():
    return "<h1>من نحن</h1>"
routes = {"/": home, "/about": about}
def handle(path):
    view = routes.get(path)
    if view is None:
        return "404 — الصفحة مش موجودة"
    return view()
for path in ["/", "/about", "/contact"]:
    print(path, "→", handle(path))
