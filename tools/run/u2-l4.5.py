READ = 4
WRITE = 2
EXECUTE = 1
perms = READ | WRITE
print(perms)
print(bool(perms & WRITE))
print(bool(perms & EXECUTE))
perms = perms | EXECUTE
print(perms, bin(perms))
perms = perms & ~WRITE
print(perms, bin(perms))
