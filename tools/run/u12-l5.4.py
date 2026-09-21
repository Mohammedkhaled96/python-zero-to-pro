import shutil
from pathlib import Path
shutil.copy("project/README.md", "project/README_backup.md")
shutil.copytree("project/data", "backup_data", dirs_exist_ok=True)
shutil.move("project/utils.py", "project/data/utils.py")
print(sorted(p.relative_to("project").as_posix() for p in Path("project").rglob("*") if p.is_file()))
shutil.rmtree("backup_data")
print(Path("backup_data").exists())
