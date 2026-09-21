import sqlite3
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("""
    CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT,
        score INTEGER
    )
""")
cur.execute("INSERT INTO students (name, city, score) VALUES (?, ?, ?)", ("سارة", "القاهرة", 91))
rows = [("أحمد", "الجيزة", 78), ("منى", "القاهرة", 85), ("علي", "طنطا", 62)]
cur.executemany("INSERT INTO students (name, city, score) VALUES (?, ?, ?)", rows)
conn.commit()
for row in cur.execute("SELECT id, name, score FROM students"):
    print(row)
