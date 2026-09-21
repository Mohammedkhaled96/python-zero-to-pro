def test_single():
    "15/03/2025 ← 2025-03-15"
    assert to_iso("15/03/2025") == "2025-03-15"

def test_in_text():
    "تاريخين جوّه جملة"
    assert to_iso("من 01/04/2025 لحد 30/04/2025.") == "من 2025-04-01 لحد 2025-04-30."

def test_invalid_left_alone():
    "45/03/2025 و 15/13/2025 و 5/3/2025 ← زي ما هم"
    for bad in ["45/03/2025", "15/13/2025", "5/3/2025"]:
        assert to_iso(bad) == bad, f"{bad} اتغيّر لـ {to_iso(bad)!r}"

def test_not_inside_numbers():
    "ما تلمسش جزء من رقم أطول"
    assert to_iso("115/03/20250") == "115/03/20250"
