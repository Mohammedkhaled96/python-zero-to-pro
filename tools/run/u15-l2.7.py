class StepCounter:
    def __init__(self, goal=8000):
        self.goal = goal
        self.steps = 0
    def walk(self, n):
        self.steps += n
    def progress(self):
        return round(self.steps / self.goal * 100)
me = StepCounter()
friend = StepCounter(4000)
me.walk(2000)
me.walk(1000)
friend.walk(3000)
print(me.steps, me.progress())
print(friend.steps, friend.progress())
