from dataclasses import dataclass, field
@dataclass(order=True)
class Book:
    year: int
    title: str = field(compare=False)
    author: str = field(compare=False)
books = [Book(2008, "Clean Code", "Martin"), Book(1994, "Design Patterns", "GoF"), Book(2019, "Fluent Python", "Ramalho")]
for b in sorted(books):
    print(b.year, b.title)
