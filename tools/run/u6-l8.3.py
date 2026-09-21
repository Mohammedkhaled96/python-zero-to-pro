n = 91
is_prime = True
for d in range(2, n):
    if n % d == 0:
        is_prime = False
        break
if is_prime:
    print(f"{n} عدد أولي")
else:
    print(f"{n} مش أولي")
