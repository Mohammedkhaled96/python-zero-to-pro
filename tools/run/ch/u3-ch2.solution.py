full_name = input("الاسم الثلاثي: ")
first, second, third = full_name.split()
print(f"{first[0]}.{second[0]}.{third[0]}".upper())
