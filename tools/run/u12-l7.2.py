print(cur.execute("SELECT name, score FROM students WHERE score >= 80 ORDER BY score DESC").fetchall())
print(cur.execute("SELECT COUNT(*), AVG(score), MAX(score) FROM students").fetchone())
for city, count, avg in cur.execute("SELECT city, COUNT(*), ROUND(AVG(score), 1) FROM students GROUP BY city ORDER BY city"):
    print(city, count, avg)
