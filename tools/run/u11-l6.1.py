def shout(text):
    return text.upper() + "!"
yell = shout
print(yell("hi"))
print(yell.__name__)
tools = [str.upper, str.lower, str.title]
for tool in tools:
    print(tool("hELLo"))
