with open("input.txt", "r", encoding="utf-8") as src:
    lines = [line.strip().upper() for line in src if line.strip()]
with open("output.txt", "w", encoding="utf-8") as dst:
    dst.write("\n".join(lines))
print(f"اتنسخ {len(lines)} سطر")
