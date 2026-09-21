import sqlite3

def fresh():
    conn = sqlite3.connect(":memory:")
    init_db(conn)
    return conn

def test_ids():
    "add_book بترجّع 1 ثم 2"
    conn = fresh()
    assert add_book(conn, "Python", 2020) == 1
    assert add_book(conn, "SQL", 2018) == 2

def test_after():
    "books_after(2015) مرتّبة بالسنة"
    conn = fresh()
    add_book(conn, "C", 1978)
    add_book(conn, "Rust", 2021)
    add_book(conn, "Go", 2016)
    assert books_after(conn, 2015) == ["Go", "Rust"]

def test_quote_title():
    "عنوان فيه علامة تنصيص: O'Reilly Guide"
    conn = fresh()
    add_book(conn, "O'Reilly Guide", 2022)
    assert books_after(conn, 2000) == ["O'Reilly Guide"]

def test_no_fstring_sql():
    "مفيش f-string جوّه أوامر SQL"
    code = USER_CODE.replace(" ", "")
    assert 'f"INSERT' not in code and "f'INSERT" not in code and 'f"SELECT' not in code and "f'SELECT" not in code, "استخدم ? بدل f-string"
