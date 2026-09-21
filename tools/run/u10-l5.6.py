emails = ["Sara@Mail.com", "sara@mail.com", "ahmed@Gmail.com"]
unique = {e.lower() for e in emails}
print(len(unique))
domains = {e.split("@")[1].lower() for e in emails}
print(sorted(domains))
