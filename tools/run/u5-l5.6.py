import copy
menu = [["قهوة", 20], ["شاي", 10]]
shallow = menu.copy()
deep = copy.deepcopy(menu)
menu[0][1] = 25
print(shallow[0][1], deep[0][1])
shallow.append(["عصير", 15])
print(len(menu), len(shallow))
