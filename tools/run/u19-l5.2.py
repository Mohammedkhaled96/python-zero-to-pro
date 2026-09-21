import pandas as pd
sales = pd.DataFrame({
    "product": ["coffee", "tea", "coffee", "juice", "tea", "coffee"],
    "branch": ["Maadi", "Maadi", "Zamalek", "Zamalek", "Zamalek", "Maadi"],
    "qty": [30, 12, 25, 18, 20, 15],
})
totals = sales.groupby("product")["qty"].sum().sort_values(ascending=False)
print(totals)
print(sales.pivot_table(index="branch", columns="product", values="qty", aggfunc="sum", fill_value=0))
