def cap(word):
    return word[:1].upper() + word[1:]
assert cap("python") == "Python"
assert cap("") == ""
try:
    assert cap("ali") == "ALI", f"متوقّع ALI لكن طلع {cap('ali')}"
except AssertionError as e:
    print("فشل:", e)
print("خلصنا")
