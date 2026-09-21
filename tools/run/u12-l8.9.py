import re
STRONG = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")
for pw in ["Secret123", "secret123", "Sec1", "SECRET123a"]:
    print(pw, bool(STRONG.match(pw)))
print(re.findall(r"(?<=\$)\d+", "price $30, tax $5, total 35"))
