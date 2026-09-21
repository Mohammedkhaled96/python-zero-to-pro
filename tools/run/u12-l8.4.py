import re
text = "رقمي ٠١٠١٢٣٤٥٦٧٨ وتليفون البيت 0223456789"
print(re.findall(r"\d+", text))
print(re.findall(r"[0-9]+", text))
print(re.findall(r"[\u0621-\u064A]+", "Python بايثون 3.12 لغة"))
harakat = re.compile(r"[\u064B-\u0652]")
print(harakat.sub("", "مُحَمَّدٌ يَكْتُبُ"))
print(re.sub(r"[إأآ]", "ا", "أحمد وإسلام وآمال"))
