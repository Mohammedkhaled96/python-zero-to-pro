sentence = input("اكتب جملة: ")
count = 0
longest = ""
for word in sentence.split():
    if len(word) > 3:
        count += 1
    if len(word) > len(longest):
        longest = word
print(f"عدد الكلمات الطويلة: {count}")
print(f"أطول كلمة: {longest}")
