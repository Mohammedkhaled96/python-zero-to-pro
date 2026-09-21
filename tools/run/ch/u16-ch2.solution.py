import re

def parse_duration(text):
    """'1h30m' ← 90"""
    clean = text.replace(" ", "").lower()
    match = re.fullmatch(r"(?:(\d+)h)?(?:(\d+)m)?", clean)
    if not clean or not match:
        raise ValueError(f"صيغة غير مفهومة: {text!r}")
    hours, minutes = match.groups()
    return int(hours or 0) * 60 + int(minutes or 0)
