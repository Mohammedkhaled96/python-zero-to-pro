def make_tag(text, tag="p"):
    print(f"<{tag}>{text}</{tag}>")
make_tag("أهلًا")
make_tag("عنوان", "h1")
make_tag(tag="b", text="مهم")
