cart = ["عيش", "لبن"]
cart.append("جبنة")
cart.insert(0, "بيض")
cart.extend(["شاي", "سكر"])
removed = cart.pop()
cart.remove("لبن")
print(cart)
print("شلنا:", removed)
