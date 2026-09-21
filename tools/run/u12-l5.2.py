from pathlib import Path
folder = Path("demo")
folder.mkdir(exist_ok=True)
note = folder / "note.txt"
note.write_text("سطر أول\nسطر تاني\n", encoding="utf-8", newline="\n")
print(note.exists(), note.is_file(), folder.is_dir())
print(note.read_text(encoding="utf-8").splitlines())
print(note.stat().st_size, "bytes")
(folder / "sub" / "deep").mkdir(parents=True, exist_ok=True)
print(sorted(x.name for x in folder.iterdir()))
