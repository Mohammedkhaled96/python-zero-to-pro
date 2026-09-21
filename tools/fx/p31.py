with open("python development.txt", "r", encoding="utf-8") as file:
    content = file.read()
    character_number = len(content)
    word_number = len(content.split())
    line_number = content.count("\n") + 1
    space_number = content.count(" ") + 1
    print(character_number)
    print(word_number)
    print(line_number)
print(space_number)
