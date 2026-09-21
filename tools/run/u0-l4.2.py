source = "x = 2 + 3\nprint(x * 10)"
code = compile(source, "demo.py", "exec")
print(type(code).__name__, code.co_filename)
print(5 in code.co_consts)
exec(code)
try:
    compile("x = ", "bad.py", "exec")
except SyntaxError as e:
    print(type(e).__name__, "في", e.filename)
