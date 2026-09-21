def is_palindrome(text):
    """True لو النص متناظر (من غير مسافات وحالة الحروف)"""
    clean = text.replace(" ", "").lower()
    return clean == clean[::-1]
