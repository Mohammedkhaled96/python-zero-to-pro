from pathlib import Path
import shutil
downloads = Path("downloads")
downloads.mkdir(exist_ok=True)
for name in ["cv.pdf", "photo.JPG", "song.mp3", "notes.txt", "scan.PDF"]:
    (downloads / name).write_text("x")
CATEGORIES = {".pdf": "Documents", ".txt": "Documents", ".jpg": "Images", ".png": "Images", ".mp3": "Music"}
for file in list(downloads.iterdir()):
    if file.is_file():
        folder = CATEGORIES.get(file.suffix.lower(), "Other")
        target = downloads / folder
        target.mkdir(exist_ok=True)
        shutil.move(file, target / file.name)
for rel in sorted(p.relative_to(downloads).as_posix() for p in downloads.rglob("*") if p.is_file()):
    print(rel)
