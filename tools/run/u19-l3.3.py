from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
iris = load_iris()
print(iris.data.shape, ", ".join(iris.target_names))
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.3, random_state=42
)
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(f"الدقّة: {accuracy_score(y_test, predictions):.0%}")
flower = [[5.1, 3.5, 1.4, 0.2]]
print(iris.target_names[model.predict(flower)[0]])
