email = input("الإيميل: ").strip().lower()
user, _, domain = email.partition("@")
print(user)
print(domain)
