email = "ahmed.ali@company.com"
user, sep, domain = email.partition("@")
print(user)
print(domain)
print("no-at-sign".partition("@"))
path = "photos/2024/trip/beach.jpg"
print(path.rpartition("/")[2])
print(path.rpartition("/")[0])
