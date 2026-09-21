grades = {"سارة": 92, "علي": 67, "منى": 78}
with open("report.txt", "w", encoding="utf-8") as f:
    f.write("تقرير الدرجات\n")
    for name, g in grades.items():
        status = "ناجح" if g >= 70 else "محتاج مراجعة"
        print(f"{name}: {g} ({status})", file=f)
    f.writelines(["---\n", "النهاية\n"])
with open("report.txt", encoding="utf-8") as f:
    print(f.read(), end="")
