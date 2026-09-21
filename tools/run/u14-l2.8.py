import time
import requests
def get_with_retry(url, attempts=3, wait=1):
    for attempt in range(1, attempts + 1):
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            return response
        except (requests.Timeout, requests.ConnectionError, requests.HTTPError) as e:
            print(f"محاولة {attempt} فشلت: {type(e).__name__}")
            if attempt == attempts:
                raise
            time.sleep(wait * attempt)
try:
    get_with_retry("https://httpbin.org/status/503", attempts=2, wait=0.5)
except requests.HTTPError:
    print("استسلمنا بعد كل المحاولات")
