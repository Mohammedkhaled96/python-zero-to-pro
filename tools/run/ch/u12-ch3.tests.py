def test_basic():
    "رقمين بصيغتين ← الاتنين بصيغة 0"
    assert extract_phones("اتصل 01012345678 أو +201112345678") == ["01012345678", "01112345678"]

def test_0020():
    "0020 ← بتتحوّل لـ 0"
    assert extract_phones("رقمي 00201512345678") == ["01512345678"]

def test_invalid_network():
    "013 مش شبكة ← ولا نتيجة"
    assert extract_phones("01312345678") == []

def test_not_inside_longer():
    "ما تاخدش 11 رقم من جوّه رقم أطول"
    assert extract_phones("كود 9901012345678 و 010123456789") == []

def test_unique_in_order():
    "التكرار مرّة واحدة والترتيب محفوظ"
    text = "01212345678, 01012345678, +201212345678"
    assert extract_phones(text) == ["01212345678", "01012345678"]
