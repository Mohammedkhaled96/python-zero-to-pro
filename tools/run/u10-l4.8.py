ali = {"منى", "سارة", "كريم", "يوسف"}
mona = {"سارة", "يوسف", "هند"}
print(sorted(ali & mona))
print(sorted(ali - mona))
print(len(ali | mona))
cities = {(30.04, 31.24): "القاهرة", (31.20, 29.92): "الإسكندرية"}
lat, lon = 30.04, 31.24
print(cities[(lat, lon)])
