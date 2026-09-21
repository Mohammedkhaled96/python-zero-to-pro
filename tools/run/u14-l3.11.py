tools = {
    "نص لصوت": "gTTS",
    "ترجمة": "deep-translator",
    "نص من صورة": "pytesseract",
    "صوت لنص": "openai-whisper",
    "طلبات ويب": "requests",
}
for task in ["ترجمة", "صوت لنص", "تعديل فيديو"]:
    lib = tools.get(task)
    if lib:
        print(f"{task}: pip install {lib}")
    else:
        print(f"{task}: دوّر على pypi.org واقرا التوثيق")
