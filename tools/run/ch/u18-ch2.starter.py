import sqlite3

def find_user(conn, username):
    query = f"SELECT id, username FROM users WHERE username = '{username}'"
    return conn.execute(query).fetchall()
