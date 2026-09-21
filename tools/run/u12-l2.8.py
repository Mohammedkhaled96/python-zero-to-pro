with open("poem.txt", "w", encoding="utf-8") as f:
    f.write("البرمجة متعة\n\nوبايثون لغة سهلة جدا\nاتعلم كل يوم\n")
lines = 0
words = 0
longest = ""
with open("poem.txt", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        lines += 1
        words += len(line.split())
        if len(line) > len(longest):
            longest = line
print(lines, words)
print(longest)
