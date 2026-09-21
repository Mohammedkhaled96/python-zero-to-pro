import sqlite3

def init_db(conn):
    conn.execute("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, year INTEGER)")

def add_book(conn, title, year):
    pass

def books_after(conn, year):
    pass
