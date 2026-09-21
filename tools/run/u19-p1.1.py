from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
messages = [
    "مبروك كسبت جايزة اضغط على الرابط",
    "عرض خاص خصم 90% اشتري دلوقتي",
    "اكسب فلوس من البيت بسرعة",
    "جايزة مجانية مستنياك اضغط هنا",
    "هنتقابل بكرة الساعة 5",
    "ممكن تبعتلي ملف المحاضرة",
    "المشروع اتسلّم الحمد لله",
    "بكرة عندنا اجتماع الساعة 10",
]
labels = ["سبام"] * 4 + ["عادي"] * 4
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(messages)
print("عدد الكلمات المختلفة:", len(vectorizer.vocabulary_))
model = MultinomialNB()
model.fit(X, labels)
tests = ["اضغط هنا واكسب جايزة", "ممكن نتقابل بكرة", "خصم على الجايزة بكرة"]
features = vectorizer.transform(tests)
for msg, label, probs in zip(tests, model.predict(features), model.predict_proba(features)):
    print(f"{label} ({max(probs):.0%}) ← {msg}")
