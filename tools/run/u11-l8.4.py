def http_status(code):
    match code:
        case 200 | 201:
            return "نجاح"
        case 404:
            return "مش موجود"
        case int() if 500 <= code < 600:
            return "خطأ في السيرفر"
        case _:
            return "حالة تانية"
for c in [200, 404, 503, 302]:
    print(c, http_status(c))
event = {"type": "order", "id": 17, "total": 250}
match event:
    case {"type": "order", "total": total} if total > 200:
        print(f"طلب كبير: {total}")
    case {"type": "order"}:
        print("طلب عادي")
