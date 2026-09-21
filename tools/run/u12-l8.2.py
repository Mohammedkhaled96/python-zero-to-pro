import re
text = "Order 66 shipped on 2025-03-15, order 67 on 2025-04-02."
m = re.search(r"\d+", text)
print(m.group(), m.start(), m.end())
print(re.match(r"\d+", text))
print(re.match(r"Order", text).group())
print(re.fullmatch(r"\d+", "2025"))
print(re.fullmatch(r"\d+", "2025a"))
print(re.findall(r"\d{4}-\d{2}-\d{2}", text))
for m in re.finditer(r"order (\d+)", text, re.IGNORECASE):
    print(m.group(1), "at", m.span())
