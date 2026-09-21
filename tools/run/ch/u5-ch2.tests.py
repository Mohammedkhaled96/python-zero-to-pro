def test_backup():
    "backup لسه [قلم، كشكول]"
    assert backup == ["قلم", "كشكول"], f"backup = {backup!r}"

def test_original():
    "original اتضاف لها مسطرة"
    assert original == ["قلم", "كشكول", "مسطرة"], f"original = {original!r}"

def test_separate():
    "backup و original قائمتين مختلفتين في الذاكرة"
    assert backup is not original, "لسه الاسمين بيشاوروا على نفس القائمة"
