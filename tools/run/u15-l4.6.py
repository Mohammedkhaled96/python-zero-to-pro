class Player:
    count = 0
    def __init__(self, name):
        self.name = name
        Player.count += 1
p1 = Player("علي")
p2 = Player("منى")
print(Player.count, p1.count)
p1.count = 100
print(Player.count, p1.count, p2.count)
