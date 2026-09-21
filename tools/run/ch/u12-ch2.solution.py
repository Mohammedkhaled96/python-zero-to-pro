import sqlite3

def init_db(conn):
    conn.execute("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, year INTEGER)")

def add_book(conn, title, year):
    with conn:
        cur = conn.execute("INSERT INTO books (title, year) VALUES (?, ?)", (title, year))
    return cur.lastrowid

def books_after(conn, year):
    rows = conn.execute("SELECT title FROM books WHERE year > ? ORDER BY year", (year,)).fetchall()
    return [title for (title,) in rows]
