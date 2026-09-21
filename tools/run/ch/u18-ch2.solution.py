import sqlite3

def find_user(conn, username):
    query = "SELECT id, username FROM users WHERE username = ?"
    return conn.execute(query, (username,)).fetchall()
