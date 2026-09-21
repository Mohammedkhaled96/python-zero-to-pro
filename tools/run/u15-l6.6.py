class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
    @property
    def celsius(self):
        return self._celsius
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("أقل من الصفر المطلق")
        self._celsius = value
    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32
t = Temperature(25)
print(t.celsius, t.fahrenheit)
try:
    t.celsius = -300
except ValueError as e:
    print("مرفوض:", e)
try:
    t.fahrenheit = 100
except AttributeError:
    print("fahrenheit للقراءة بس")
