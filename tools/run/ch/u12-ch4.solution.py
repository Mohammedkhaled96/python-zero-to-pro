import re

def bold_texts(html):
    return re.findall(r"<b>(.*?)</b>", html)
