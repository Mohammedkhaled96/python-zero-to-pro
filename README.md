# كورس بايثون الشامل — من الصفر إلى الاحتراف

> Interactive Arabic Python course — runs Python in your browser, works offline.

### 🔗 [افتح الكورس من هنا](https://mohammedkhaled96.github.io/python-zero-to-pro/)

[![Open the course](https://img.shields.io/badge/GitHub%20Pages-افتح%20الكورس-2ea44f?logo=github)](https://mohammedkhaled96.github.io/python-zero-to-pro/)
[![Pyodide](https://img.shields.io/badge/Python%20in%20the%20browser-Pyodide-3776AB?logo=python&logoColor=white)](https://pyodide.org)
![Offline ready](https://img.shields.io/badge/Offline-Service%20Worker-4CAF50)
![Language](https://img.shields.io/badge/اللغة-العربية-orange)

كورس بايثون كامل بالعربي، من أول `print` لحد البرمجة الكائنية والاختبارات والمشاريع الحقيقية.
كل سطر كود مشروح، وتقدر **تجرّب الكود جوه الصفحة نفسها** من غير ما تنصّب أي حاجة.

## ✨ المميزات

- **شغّل الكود في المتصفح:** بايثون حقيقي عن طريق Pyodide — من غير تنصيب.
- **يشتغل بدون إنترنت:** الـ Service Worker بيخزّن الكورس وملفات بايثون بعد أول زيارة.
- **20 وحدة** بشرح متدرّج، مع تحديات وتصحيح آلي وبحث داخل كل المحتوى.
- **بالعربي بالكامل** مع دعم الكتابة من اليمين لليسار.
- **نسخة ملف واحد:** `dist/python-course.html` تقدر تنقلها أو تشغّلها لوحدها.

## 🚀 التشغيل محليًا

الـ Service Worker محتاج خادم (مش بيشتغل مع `file://`):

```bash
git clone https://github.com/Mohammedkhaled96/python-zero-to-pro.git
cd python-zero-to-pro
python -m http.server 8000
```

بعدها افتح `http://localhost:8000`. على ويندوز تقدر تشغّل `start-local.cmd` على طول.

## 📁 هيكل المشروع

| المسار | الوظيفة |
|---|---|
| `index.html` | صفحة الكورس الأساسية (بتحمّل المحتوى والأكواد) |
| `assets/css/` | الأنماط مقسّمة بطبقات: `tokens`, `layout`, `content`, `components`, `responsive`, `print` |
| `content/units/` | محتوى الوحدات (20 وحدة HTML) |
| `content/notes/` | ملاحظات وتمارين كل وحدة (JSON) |
| `content/course.json` | فهرس الكورس وترتيب الوحدات |
| `content/search-index.json` | فهرس البحث داخل الكورس |
| `src/` | كود الواجهة: `core`, `data`, `features`, `runtime`, `ui` |
| `dist/python-course.html` | نسخة الكورس كلها في ملف واحد |
| `sw.js` | Service Worker للتشغيل بدون إنترنت |
| `tools/` | أدوات التدقيق وبناء المحتوى (مش لازمة للتشغيل) |
| `.nojekyll` | يمنع GitHub Pages من معالجة الملفات بـ Jekyll |

## ✍️ المؤلف

**Mohammed Khaled** — [GitHub](https://github.com/Mohammedkhaled96)

جميع الإيميلات وأرقام الهواتف داخل أمثلة الكورس بيانات تعليمية للتوضيح فقط.
