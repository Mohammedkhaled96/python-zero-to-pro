import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
products = ["coffee", "tea", "juice"]
totals = [70, 32, 18]
plt.figure(figsize=(6, 3.5))
plt.bar(products, totals, color=["#4da3ff", "#7c5cff", "#3ddc97"])
plt.title("Sales by product")
plt.ylabel("Quantity")
plt.savefig("sales.png", dpi=110, bbox_inches="tight")
print("اتحفظ الرسم في sales.png")
