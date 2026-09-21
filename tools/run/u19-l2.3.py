data = [(60, 600000), (80, 800000), (100, 1000000), (120, 1200000)]
rate = sum(price / area for area, price in data) / len(data)
print("سعر المتر اللي اتعلّمه:", round(rate))
def predict(area):
    return round(rate * area)
print("توقّع 90 متر:", predict(90))
errors = [abs(predict(a) - p) for a, p in data]
print("أكبر خطأ على بيانات التدريب:", max(errors))
