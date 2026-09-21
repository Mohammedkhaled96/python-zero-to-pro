import re
PHONE = re.compile(r"""
    (?:\+20|0)      # كود الدولة أو صفر
    1[0125]         # شبكة المحمول
    \d{8}           # باقي الرقم
""", re.VERBOSE)
print(PHONE.findall("01012345678 / +201212345678"))
print(re.findall(r"^\w+", "first line\nsecond line", re.MULTILINE))
print(re.findall(r"python", "Python PYTHON python", re.I))
print(re.findall(r"a.c", "abc\na\nc", re.DOTALL))
