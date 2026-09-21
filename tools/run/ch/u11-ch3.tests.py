def test_fresh_each_time():
    "كل نداء من غير قائمة بيبدأ فاضي"
    first = add_item("a")
    second = add_item("b")
    assert second == ["b"], f"النداء التاني رجّع {second!r}"
    assert first == ["a"], f"النداء الأول بقى {first!r}"

def test_given_list():
    "لو بعتّ قائمة، العنصر بيتضاف لها هي"
    box = ["x"]
    result = add_item("y", box)
    assert box == ["x", "y"] and result is box
