school = {
    "class_a": {"teacher": "منى", "students": ["سارة", "علي"]},
    "class_b": {"teacher": "عمر", "students": ["خالد"]},
}
print(school["class_a"]["teacher"])
school["class_b"]["students"].append("ليلى")
for name, info in school.items():
    count = len(info["students"])
    print(f"{name}: {info['teacher']} — {count} طالب")
print(school.get("class_c", {}).get("teacher", "مفيش فصل كده"))
