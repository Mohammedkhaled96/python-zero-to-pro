temp = 24
if temp >= 30:
    print("حر — اشرب مية كتير")
elif temp >= 20:
    print("جو لطيف")
else:
    print("برد — البس جاكيت")
label = "زوجي" if temp % 2 == 0 else "فردي"
print(label)
