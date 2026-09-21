import sqlite3
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, score INTEGER)")
cur.executemany("INSERT INTO students (name, city, score) VALUES (?, ?, ?)", [("سارة", "القاهرة", 91), ("أحمد", "الجيزة", 78), ("منى", "القاهرة", 85), ("علي", "طنطا", 62)])
conn.commit()
