import re
user_input = "3.5+"
print(re.findall(user_input, "version 3.5+ and 3x5"))
print(re.findall(re.escape(user_input), "version 3.5+ and 3x5"))
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
for e in ["farid@gmail.com", "a@b..com", "no-at.com", "x@site.co.uk"]:
    print(e, bool(EMAIL.fullmatch(e)))
