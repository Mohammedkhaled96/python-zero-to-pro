import os, tempfile

def tmp_path():
    return os.path.join(tempfile.mkdtemp(), "scores.txt")

def test_file_format():
    "الملف فيه name,score مرتّب من الأعلى"
    path = tmp_path()
    save_scores(path, {"ali": 78, "sara": 91})
    with open(path, encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]
    assert lines == ["sara,91", "ali,78"], lines

def test_load_types():
    "load_scores بترجّع أرقام int"
    path = tmp_path()
    with open(path, "w", encoding="utf-8") as f:
        f.write("mona,85\nomar,60\n")
    assert load_scores(path) == {"mona": 85, "omar": 60}

def test_round_trip_arabic():
    "حفظ واسترجاع بأسماء عربي"
    path = tmp_path()
    data = {"سارة": 95, "أحمد": 70}
    save_scores(path, data)
    assert load_scores(path) == data
