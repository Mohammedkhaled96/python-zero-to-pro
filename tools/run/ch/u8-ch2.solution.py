secret = 7
attempts = 0
while attempts < 3:
    guess = int(input("خمّن: "))
    attempts += 1
    if guess == secret:
        print("صح!")
        break
else:
    print("خلصت المحاولات")
