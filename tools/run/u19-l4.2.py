from collections import Counter, defaultdict
text = "أنا بحب بايثون . أنا بحب البرمجة . أنا بتعلّم بايثون كل يوم . بايثون سهلة"
words = text.split()
next_words = defaultdict(Counter)
for current, following in zip(words, words[1:]):
    next_words[current][following] += 1
print(next_words["أنا"].most_common())
print(next_words["بحب"].most_common())
word = "أنا"
sentence = [word]
for _ in range(3):
    word = next_words[word].most_common(1)[0][0]
    sentence.append(word)
print(" ".join(sentence))
