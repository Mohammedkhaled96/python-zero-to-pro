import json, pathlib, shutil
shutil.rmtree("pilot", ignore_errors=True)
d = pathlib.Path("pilot"); d.mkdir()
data = [
 {"done": {"u1-l1": 1}, "feedback": {"u2-l2": {"v": -1, "note": "مثال التحويل محتاج توضيح"}, "u1-l1": {"v": 1}},
  "timeSeconds": {"u1-l1": 600, "u2-l2": 1500}, "challenges": {"u2-ch1": {"solved": True, "tries": 2}, "u4-ch2": {"solved": False, "tries": 4}}},
 {"done": {}, "feedback": {"u2-l2": {"v": -1, "note": "مش فاهم ليه int بتقع"}, "u4-l2": {"v": -1}},
  "timeSeconds": {"u1-l1": 420, "u2-l2": 1800}, "challenges": {"u2-ch1": {"solved": True, "tries": 1}, "u4-ch2": {"solved": True, "tries": 6}}},
 {"done": {}, "feedback": {"u4-l2": {"v": -1, "note": "الـ elif ملخبطة"}},
  "timeSeconds": {"u1-l1": 540, "u4-l2": 2400}, "challenges": {"u2-ch1": {"solved": False, "tries": 3}, "u4-ch2": {"solved": False, "tries": 2}}},
]
for i, s in enumerate(data, 1):
    (d / f"student-{i:02d}.json").write_text(json.dumps(s, ensure_ascii=False), encoding="utf-8")
