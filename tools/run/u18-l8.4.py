import os
api_key = os.environ.get("WEATHER_API_KEY")
if api_key is None:
    print("⚠️ متغيّر WEATHER_API_KEY مش متظبط")
else:
    print("المفتاح موجود:", api_key[:4] + "…")
