class ValidationError(ValueError):
    def __init__(self, field, message):
        self.field = field
        super().__init__(f"{field}: {message}")
def validate_user(data):
    if len(data.get("name", "")) < 2:
        raise ValidationError("name", "قصير جدًا")
    if not 18 <= data.get("age", 0) <= 100:
        raise ValidationError("age", "خارج النطاق")
users = [{"name": "سارة", "age": 30}, {"name": "م", "age": 30}, {"name": "علي", "age": 12}]
errors = []
for u in users:
    try:
        validate_user(u)
    except ValidationError as e:
        errors.append(e.field)
print(errors)
