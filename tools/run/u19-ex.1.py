from sklearn.linear_model import LinearRegression
X = [[50, 1], [80, 2], [100, 2], [120, 3], [150, 4]]
y = [520, 790, 1010, 1180, 1530]
model = LinearRegression().fit(X, y)
print([round(c, 1) for c in model.coef_])
print(round(model.predict([[100, 3]])[0]))
