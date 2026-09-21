def create_user(name, *, admin=False, active=True):
    return f"{name} admin={admin} active={active}"
print(create_user("sara", admin=True))
try:
    create_user("sara", True)
except TypeError as e:
    print(e)
def power(base, exp, /):
    return base ** exp
print(power(2, 10))
