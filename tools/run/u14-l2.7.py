import requests
def fetch(url):
    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
        return response.json()
    except requests.Timeout:
        print("⏱ الخادم اتأخّر — جرّب تاني بعدين")
    except requests.ConnectionError:
        print("🌐 مفيش اتصال بالخادم")
    except requests.HTTPError as e:
        print(f"❌ الخادم رد بخطأ {e.response.status_code}")
    except ValueError:
        print("📄 الرد مش JSON")
    return None
fetch("https://httpbin.org/status/404")
fetch("https://httpbin.org/delay/5")
fetch("https://no-such-host.invalid")
fetch("https://httpbin.org/html")
print(fetch("https://httpbin.org/json")["slideshow"]["title"])
