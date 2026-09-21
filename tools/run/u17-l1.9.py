def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)
def reverse(s):
    if len(s) <= 1:
        return s
    return reverse(s[1:]) + s[0]
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)
print(digit_sum(2026))
print(reverse("بايثون"))
print(power(2, 10))
