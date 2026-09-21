class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
    def pay(self):
        return self.salary
class Manager(Employee):
    def __init__(self, name, salary, bonus):
        super().__init__(name, salary)
        self.bonus = bonus
    def pay(self):
        return super().pay() + self.bonus
staff = [Employee("علي", 8000), Manager("سارة", 12000, 3000)]
for person in staff:
    print(person.name, person.pay())
print(isinstance(staff[1], Employee))
