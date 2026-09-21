import sqlite3
from datetime import date
def init_db(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY,
            day TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL CHECK (amount > 0),
            note TEXT DEFAULT ''
        )
    """)
def add_expense(conn, day, category, amount, note=""):
    with conn:
        conn.execute(
            "INSERT INTO expenses (day, category, amount, note) VALUES (?, ?, ?, ?)",
            (day.isoformat(), category.strip().lower(), amount, note),
        )
def month_total(conn, year, month):
    prefix = f"{year:04d}-{month:02d}-%"
    row = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE day LIKE ?", (prefix,)).fetchone()
    return row[0]
def by_category(conn, year, month):
    prefix = f"{year:04d}-{month:02d}-%"
    return conn.execute(
        """SELECT category, SUM(amount) AS total, COUNT(*) AS n
           FROM expenses WHERE day LIKE ?
           GROUP BY category ORDER BY total DESC""",
        (prefix,),
    ).fetchall()
conn = sqlite3.connect(":memory:")
init_db(conn)
add_expense(conn, date(2025, 3, 2), "Food", 120)
add_expense(conn, date(2025, 3, 5), "transport", 45.5, "مترو")
add_expense(conn, date(2025, 3, 9), "food ", 80)
add_expense(conn, date(2025, 3, 20), "bills", 650)
add_expense(conn, date(2025, 4, 1), "food", 60)
print(f"إجمالي مارس: {month_total(conn, 2025, 3):.2f}")
for category, total, n in by_category(conn, 2025, 3):
    print(f"{category:<10} {total:>8.2f}  ({n} عملية)")
try:
    add_expense(conn, date(2025, 3, 21), "food", -5)
except sqlite3.IntegrityError as e:
    print("اترفض:", e)
print(month_total(conn, 2025, 3))
