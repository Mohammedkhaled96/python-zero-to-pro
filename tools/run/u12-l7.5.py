import sqlite3
with sqlite3.connect("school.db") as conn:
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        DROP TABLE IF EXISTS courses;
        DROP TABLE IF EXISTS enrollments;
        CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);
        CREATE TABLE enrollments (student TEXT, course_id INTEGER REFERENCES courses(id));
        INSERT INTO courses VALUES (1, 'Python'), (2, 'SQL');
        INSERT INTO enrollments VALUES ('سارة', 1), ('سارة', 2), ('أحمد', 1);
    """)
    query = """
        SELECT e.student, c.title
        FROM enrollments AS e
        JOIN courses AS c ON c.id = e.course_id
        ORDER BY c.title, e.student
    """
    for row in conn.execute(query):
        print(row["student"], "←", row["title"])
conn.close()
