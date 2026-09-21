name = "x' OR '1'='1"
unsafe = f"SELECT COUNT(*) FROM students WHERE name = '{name}'"
print(unsafe)
print(cur.execute(unsafe).fetchone())
print(cur.execute("SELECT COUNT(*) FROM students WHERE name = ?", (name,)).fetchone())
