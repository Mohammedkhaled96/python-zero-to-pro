def test_independent():
    "كل طالب ليه كورساته"
    a = Student("sara")
    b = Student("ali")
    a.enroll("Python")
    assert a.courses == ["Python"], a.courses
    assert b.courses == [], f"علي اتسجّل في {b.courses} من غير ما يطلب"

def test_multiple():
    "طالب يسجّل في كورسين"
    s = Student("mona")
    s.enroll("SQL")
    s.enroll("Git")
    assert s.courses == ["SQL", "Git"], s.courses
