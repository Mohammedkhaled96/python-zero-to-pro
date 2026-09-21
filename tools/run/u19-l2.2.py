from sklearn.linear_model import LinearRegression
X = [[50], [80], [100], [120], [150]]
y = [520, 790, 1010, 1180, 1530]
model = LinearRegression()
model.fit(X, y)
print(round(model.coef_[0], 2), round(model.intercept_, 1))
print(round(model.predict([[90]])[0]))
