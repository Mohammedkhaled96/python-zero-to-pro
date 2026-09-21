def test_one():
    "وسم واحد ← ['مهم']"
    assert bold_texts("ده <b>مهم</b>") == ["مهم"]

def test_two():
    "وسمين ← كل واحد لوحده"
    got = bold_texts("<b>أ</b> و <b>ب</b>")
    assert got == ["أ", "ب"], f"رجّعت {got!r}"

def test_none():
    "مفيش وسوم ← []"
    assert bold_texts("نص عادي") == []
