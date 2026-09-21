import json
from datetime import date

def save_notes(path, notes):
    with open(path, "w") as f:
        json.dump(notes, f)

def load_notes(path):
    with open(path) as f:
        return json.load(f)
