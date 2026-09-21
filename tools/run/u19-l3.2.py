from sklearn.neighbors import KNeighborsClassifier
X = [[150, 9], [170, 8], [140, 9], [130, 3], [120, 2], [160, 4]]
y = ["تفاحة", "تفاحة", "تفاحة", "برتقالة", "برتقالة", "برتقالة"]
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)
print(model.predict([[155, 7], [125, 3]]))
