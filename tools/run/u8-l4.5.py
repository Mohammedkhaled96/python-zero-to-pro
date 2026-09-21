secret = "1234"
guesses = ["0000", "1111", "1234"]
attempts = 0
while attempts < 3:
    guess = guesses[attempts]
    attempts += 1
    if guess == secret:
        print(f"اتفتح بعد {attempts} محاولات")
        break
else:
    print("الحساب اتقفل 🔒")
