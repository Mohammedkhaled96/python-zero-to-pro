def analyze_file(path):
    """بترجّع قاموس فيه إحصائيات الملف"""
    try:
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()
    except FileNotFoundError:
        print(f"الملف '{path}' مش موجود")
        return None
    lines = content.splitlines()
    words = content.split()
    return {
        "أحرف (بالمسافات)": len(content),
        "أحرف (بدون مسافات)": len(content.replace(" ", "").replace("\n", "")),
        "كلمات": len(words),
        "أسطر": len(lines),
        "أسطر غير فاضية": len([l for l in lines if l.strip()]),
        "مسافات": content.count(" "),
        "متوسط طول الكلمة": round(sum(len(w) for w in words) / len(words), 1) if words else 0,
        "أطول كلمة": max(words, key=len) if words else "-",
    }
def top_words(path, n=5):
    """بترجّع أكتر n كلمة تكرارًا"""
    with open(path, "r", encoding="utf-8") as f:
        words = f.read().lower().split()
    counter = {}
    for w in words:
        clean = w.strip(".,!?;:\"'()")
        if len(clean) > 2:
            counter[clean] = counter.get(clean, 0) + 1
    return sorted(counter.items(), key=lambda x: x[1], reverse=True)[:n]
# --- التشغيل ---
path = input("اسم الملف: ").strip()
stats = analyze_file(path)
if stats:
    print("\n" + "=" * 36)
    print(f"  تحليل: {path}")
    print("=" * 36)
    for key, value in stats.items():
        print(f"  {key:22} : {value}")
    print("\n  أكثر الكلمات تكرارًا:")
    for word, count in top_words(path):
        print(f"    {word:15} {count} مرّة")
    print("=" * 36)
