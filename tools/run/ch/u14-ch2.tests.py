def test_basic():
    "إيميلين في نص عادي"
    text = "كلّم sara@mail.com أو ahmed.ali@company.co.uk بكرة"
    assert extract_emails(text) == ["ahmed.ali@company.co.uk", "sara@mail.com"], extract_emails(text)

def test_dupes_and_case():
    "تكرار بحروف مختلفة ← مرّة واحدة بحروف صغيرة"
    assert extract_emails("Sara@Mail.com, sara@mail.com") == ["sara@mail.com"]

def test_none():
    "مفيش إيميلات ← قائمة فاضية"
    assert extract_emails("مفيش حاجة هنا @ ولا هنا") == []
