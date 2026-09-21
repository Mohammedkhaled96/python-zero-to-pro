/* ============================================================================
   tools/bundle — بيطلّع نسخة «ملف واحد» من المشروع المقسّم
     node tools/bundle.js            →  dist/python-course.html
   النسخة دي بتشتغل بالضغط المباشر على الملف (file://) من غير سيرفر.
   الفكرة: نحقن الأنماط والمحتوى والشرح وكود بايثون والمحرّك جوّه صفحة واحدة،
   وطبقات البيانات في src بتلاقي المحقون وتستخدمه بدل fetch.
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const manifest = JSON.parse(read("content/course.json"));

/* ---------- 1) دمج وحدات الـ ES Modules في ملف واحد ---------- */
const MODULE_DIR = path.join(ROOT, "src");
const seen = new Set();
const chunks = [];

function resolveImport(from, spec) {
  return path.resolve(path.dirname(from), spec);
}

function inlineModule(file) {
  const abs = path.resolve(file);
  if (seen.has(abs)) return;
  seen.add(abs);
  let code = fs.readFileSync(abs, "utf8");

  /* نحمّل اللي بيستورد منهم الأول (ترتيب التبعية) */
  const importRe = /^\s*import\s+(?:[\s\S]*?)\s+from\s+["']([^"']+)["'];?\s*$/gm;
  let m;
  const deps = [];
  while ((m = importRe.exec(code))) if (m[1].startsWith(".")) deps.push(resolveImport(abs, m[1]));
  deps.forEach(inlineModule);

  code = code
    .replace(importRe, "")                                   /* شيل سطور الاستيراد */
    .replace(/^\s*export\s+(const|let|var|function|async function|class)\s/gm, "$1 ")
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, "")
    .replace(/\bawait import\(["'][^"']+["']\)/g, "Promise.resolve(window.__mods)")
    .replace(/import\.meta\.url/g, "document.baseURI");   /* سكربت عادي مش module */

  chunks.push("/* ===== " + path.relative(MODULE_DIR, abs).replace(/\\/g, "/") + " ===== */\n" + code.trim());
}

inlineModule(path.join(MODULE_DIR, "main.js"));

/* offline.js بيستورد ديناميكيًا — في النسخة المدمجة بنديله نفس الدوال */
const bundledJS =
  "(function(){\n\"use strict\";\n" +
  chunks.join("\n\n") +
  "\nwindow.__mods = { course, loadUnitContent };\n})();";

/* ---------- 2) الأنماط ---------- */
const css = ["tokens", "layout", "content", "components", "responsive", "print"]
  .map(name => "/* ===== " + name + ".css ===== */\n" + read("assets/css/" + name + ".css"))
  .join("\n");

/* ---------- 3) الصفحة ---------- */
let html = read("index.html");

/* روابط الأنماط ← style واحد */
html = html.replace(/<link rel="stylesheet"[^>]*>\s*/g, "");
html = html.replace(/<link rel="preload"[^>]*>\s*/g, "");
/* دوال بدل نصوص في الاستبدال: عشان $$ و $& في الكود ما تتفسّرش كأنماط */
html = html.replace("</head>", () => "<style>\n" + css + "\n</style>\n</head>");

/* الأيقونة inline */
const favicon = read("assets/favicon.svg").replace(/\s*\n\s*/g, "");
html = html.replace('<link rel="icon" href="assets/favicon.svg">',
  () => '<link rel="icon" href="data:image/svg+xml,' + encodeURIComponent(favicon) + '">');

/* المحتوى: المانيفست + الوحدات + الشرح + البحث + بايثون + كود الخيط */
const data = [];
data.push('<script type="application/json" id="course-manifest">' + read("content/course.json") + "</script>");
manifest.units.forEach(u => {
  data.push('<template id="tpl-unit-' + u.num + '">' + read("content/" + u.file) + "</template>");
  data.push('<script type="application/json" id="notes-unit-' + u.num + '">' + read("content/" + u.notes) + "</script>");
});
data.push('<script type="application/json" id="search-index">' + read("content/search-index.json") + "</script>");
data.push('<script type="text/plain" id="py-harness">\n' + read("src/runtime/harness.py") + "</script>");
data.push('<script type="text/plain" id="worker-src">\n' + read("src/runtime/worker.js") + "</script>");

/* جزء التشغيل في index.html (ما بين BOOT:START و BOOT:END) بيتستبدل كله بالبيانات والكود المدمج */
const bootRe = /<!-- BOOT:START[\s\S]*?<!-- BOOT:END -->/;
if (!bootRe.test(html)) {
  console.error("✗ مش لاقي علامتي BOOT:START و BOOT:END في index.html — الحزمة كانت هتطلع من غير كود.");
  process.exit(1);
}
html = html.replace(bootRe, () => data.join("\n") + "\n<script>\n" + bundledJS + "\n</script>");

/* ---------- 4) الحفظ ---------- */
const outDir = path.join(ROOT, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "python-course.html");
fs.writeFileSync(outFile, html, "utf8");

console.log("✓ نسخة الملف الواحد:", path.relative(ROOT, outFile), "·", Math.round(Buffer.byteLength(html) / 1024), "KB");
console.log("  وحدات:", manifest.units.length, "· دروس:", manifest.stats.lessons, "· وحدات كود مدمجة:", seen.size);
