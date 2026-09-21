import json
student = {"name": "سارة", "age": 21, "skills": ["Python", "SQL"], "graduated": False, "gpa": None}
text = json.dumps(student)
print(text)
print(type(text))
pretty = json.dumps(student, ensure_ascii=False, indent=2)
print(pretty)
back = json.loads(text)
print(back == student, type(back))
