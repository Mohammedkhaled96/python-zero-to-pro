import sqlite3

def db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)")
    conn.executemany("INSERT INTO users (username) VALUES (?)", [("sara",), ("ali",), ("o'neil",)])
    return conn

def test_normal():
    "sara ← صف واحد"
    assert find_user(db(), "sara") == [(1, "sara")]

def test_injection():
    "x' OR '1'='1 ← ولا صف"
    rows = find_user(db(), "x' OR '1'='1")
    assert rows == [], f"الثغرة لسه موجودة: رجّعت {rows}"

def test_quote_name():
    "o'neil ← بيتلاقي من غير خطأ"
    assert find_user(db(), "o'neil") == [(3, "o'neil")]
