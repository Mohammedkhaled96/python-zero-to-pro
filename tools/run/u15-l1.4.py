book_dict = {"title": "بايثون", "pages": 300}
print(book_dict.get("titel"))
class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
b = Book("بايثون", 300)
print(b.title, b.pages)
try:
    print(b.titel)
except AttributeError:
    print("الكلاس كشف الغلطة")
