import re
html = "<b>مهم</b> و <b>عاجل</b>"
print(re.findall(r"<b>.*</b>", html))
print(re.findall(r"<b>.*?</b>", html))
print(re.findall(r"<b>(.*?)</b>", html))
