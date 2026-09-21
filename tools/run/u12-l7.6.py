import sqlite3
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, genre TEXT, price REAL)")
books = [("بايثون من الصفر", "تقنية", 180.0), ("الخوارزميات", "تقنية", 250.0), ("رحلة في الفضاء", "علوم", 120.0)]
cur.executemany("INSERT INTO books (title, genre, price) VALUES (?, ?, ?)", books)
conn.commit()
print(cur.execute("SELECT title, price FROM books ORDER BY price DESC LIMIT 1").fetchone())
print(cur.execute("SELECT COUNT(*), ROUND(AVG(price), 1) FROM books").fetchone())
for genre, count in cur.execute("SELECT genre, COUNT(*) FROM books GROUP BY genre ORDER BY genre"):
    print(genre, count)
conn.close()
