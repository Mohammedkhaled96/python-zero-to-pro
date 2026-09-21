answers = ["abc", "-5", "17"]
i = 0
while True:
    text = answers[i]
    i += 1
    if text.isdigit():
        age = int(text)
        break
    print(f"«{text}» مش رقم صحيح موجب — حاول تاني")
print("العمر:", age)
