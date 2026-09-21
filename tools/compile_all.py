"""يترجم كل بلوك كود بايثون في الكورس ويبلّغ عن أخطاء التركيب غير المقصودة."""
import re, html, sys, io, contextlib, builtins, os, tempfile

SRC = r"E:/lectures python material/final material/final material/python-course.html"
page = open(SRC, encoding="utf-8").read()
arts = re.finditer(r'<article class="lesson[^"]*" id="([^"]+)">(.*?)</article>', page, re.S)
bad = 0
total = 0
runtime_issues = []
for a in arts:
    lid, body = a.group(1), a.group(2)
    for n, m in enumerate(re.finditer(r'<div class="code"([^>]*)><pre>(.*?)</pre>', body, re.S), 1):
        attrs, code = m.group(1), html.unescape(m.group(2)).lstrip("\n")
        f = re.search(r'data-file="([^"]+)"', attrs)
        fname = f.group(1) if f else "python"
        if fname != "python" and not fname.endswith(".py"):
            continue
        if re.search(r"^\s*(pip|python|git|pytest|mypy|cd|fastapi)\s", code, re.M) and not re.search(r"^\s*(def|import|print)", code, re.M):
            continue
        if "<<<<<<<" in code or code.lstrip().startswith(">>>"):
            continue
        total += 1
        try:
            compile(code, f"{lid}.{n}", "exec")
        except SyntaxError as e:
            intentional = re.search(r"SyntaxError|IndentationError|❌|خطأ|غلط", code)
            if not intentional:
                bad += 1
                print(f"✗ {lid}.{n}: {e.msg} (line {e.lineno}): {code.splitlines()[e.lineno-1] if e.lineno else ''}")
print(f"compiled {total} blocks, unexpected syntax errors: {bad}")
