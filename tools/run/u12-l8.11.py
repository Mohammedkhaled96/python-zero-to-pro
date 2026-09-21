import re
tweet = "بدأت أتعلّم #Python و #بايثون_للمبتدئين مع #python و#AI"
tags = re.findall(r"#(\w+)", tweet)
unique = list(dict.fromkeys(t.lower() for t in tags))
print(unique)
