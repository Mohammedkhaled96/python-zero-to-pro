from pathlib import Path
folder = Path("photos")
folder.mkdir(exist_ok=True)
for name in ["IMG_001.jpg", "IMG_002.jpg", "IMG_003.jpg"]:
    (folder / name).write_text("x")
for i, file in enumerate(sorted(folder.glob("IMG_*.jpg")), start=1):
    file.rename(folder / f"رحلة_الساحل_{i:02d}{file.suffix}")
print(sorted(p.name for p in folder.iterdir()))
