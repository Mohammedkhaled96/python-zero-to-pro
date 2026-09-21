import re
print(re.sub(r"\s+", " ", "كتير     من    المسافات   هنا"))
print(re.sub(r"(\d{2})/(\d{2})/(\d{4})", r"\3-\2-\1", "الميعاد 15/03/2025 و 01/04/2025"))
print(re.sub(r"\d(?=\d{4})", "*", "Card 4111111111111234"))
print(re.split(r"\s*[,;|]\s*", "sara, ali;mona |omar"))
def mask_email(m):
    user = m.group(1)
    return user[0] + "***@" + m.group(2)
print(re.sub(r"([\w.]+)@([\w.]+)", mask_email, "contact sara.ahmed@mail.com now"))
