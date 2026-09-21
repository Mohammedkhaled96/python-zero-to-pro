secret = 7
attempts = 0
while attempts < 3:
    guess = int(input("خمّن: "))
    if guess == secret:
        print("صح!")
        break
else:
    print("خلصت المحاولات")
