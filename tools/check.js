/* ============================================================================
   tools/check — تدقيق المحتوى قبل النشر
     node tools/check.js
   بيتأكّد من:
     1) كل سطر كود له شرح، وعدد الشروح = عدد السطور
     2) مفيش سطور فاضية جوّه الكود
     3) الاختبارات سليمة (data-a في المدى) والمعرّفات مش مكرّرة
     4) الروابط الداخلية بتوصل لعناصر موجودة
     5) الفهرس (course.json) متطابق مع ملفات المحتوى
   ============================================================================ */
const fs = require("fs");
const path = require("path");
const C = require("./lib/content.js");

let errors = 0, warnings = 0;
const fail = msg => { errors++; console.log("  ✗ " + msg); };
const warn = msg => { warnings++; console.log("  ! " + msg); };

/* ---------- 1) الشرح سطرًا بسطر ---------- */
console.log("\n[1] شرح الكود سطرًا بسطر");
const blocks = C.codeBlocks();
let notesAll = {};
C.unitFiles().forEach(file => { notesAll = Object.assign(notesAll, C.readNotes(file)); });

let withNotes = 0, blankLines = 0;
Object.keys(blocks).forEach(key => {
  const lines = blocks[key];
  lines.forEach((line, i) => { if (!line.trim()) { blankLines++; fail(key + ": سطر فاضي رقم " + (i + 1)); } });
  const notes = notesAll[key];
  if (!notes) return;
  withNotes++;
  if (notes.length !== lines.length) fail(key + ": عدد الشروح " + notes.length + " ≠ عدد السطور " + lines.length);
  else lines.forEach((line, i) => {
    if (line.trim() && !String(notes[i] || "").trim()) fail(key + ": السطر " + (i + 1) + " بدون شرح");
  });
});
Object.keys(notesAll).forEach(key => { if (!blocks[key]) warn("شرح لمفتاح مش موجود: " + key); });
console.log("  بلوكات: " + Object.keys(blocks).length + " · مشروح: " + withNotes + " · سطور فاضية: " + blankLines);

/* ---------- 2) الاختبارات والمعرّفات ---------- */
console.log("\n[2] الاختبارات والمعرّفات");
const ids = new Map();
let questions = 0;
C.unitFiles().forEach(file => {
  const html = C.readUnit(file);
  const clean = html.replace(/<pre>[\s\S]*?<\/pre>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");
  let m;
  const idRe = /\sid="([^"]+)"/g;
  while ((m = idRe.exec(clean))) {
    if (ids.has(m[1])) fail("معرّف مكرّر: " + m[1] + " (" + ids.get(m[1]) + " و " + file + ")");
    else ids.set(m[1], file);
  }
  const qRe = /<div class="q" data-a="(\d+)">([\s\S]*?)<\/div>\s*(?=<div class="q"|<\/div>)/g;
  while ((m = qRe.exec(clean))) {
    questions++;
    const options = (m[2].match(/<label>/g) || []).length;
    if (+m[1] >= options) fail(file + ": سؤال إجابته " + m[1] + " والخيارات " + options);
  }
});
console.log("  معرّفات: " + ids.size + " · أسئلة: " + questions);

/* ---------- 3) الروابط الداخلية ---------- */
console.log("\n[3] الروابط الداخلية");
const generated = new Set();
C.lessons().forEach(lesson => {
  const heads = (lesson.body.match(/\n\s*<h4[\s>]/g) || []).length;
  for (let i = 1; i <= heads; i++) generated.add(lesson.id + "-p" + i);
});
let links = 0, broken = 0;
C.unitFiles().forEach(file => {
  const html = C.readUnit(file).replace(/<pre>[\s\S]*?<\/pre>/g, "");
  let m;
  const re = /href="#([^"]+)"/g;
  while ((m = re.exec(html))) {
    links++;
    const id = decodeURIComponent(m[1]);
    if (!ids.has(id) && !generated.has(id) && !/^unit-\d+$/.test(id)) { broken++; fail("رابط مكسور: #" + id + " في " + file); }
  }
});
console.log("  روابط: " + links + " · مكسور: " + broken);

/* ---------- 4) الفهرس متطابق مع المحتوى ---------- */
console.log("\n[4] الفهرس (course.json)");
const manifest = JSON.parse(fs.readFileSync(path.join(C.ROOT, "content", "course.json"), "utf8"));
const manifestIds = new Set(manifest.units.flatMap(u => u.lessons.map(l => l.id)));
const contentIds = new Set(C.lessons().map(l => l.id));
contentIds.forEach(id => { if (!manifestIds.has(id)) fail("درس في المحتوى ومش في الفهرس: " + id + " — شغّل node tools/reindex.js"); });
manifestIds.forEach(id => { if (!contentIds.has(id)) fail("درس في الفهرس ومش في المحتوى: " + id + " — شغّل node tools/reindex.js"); });
manifest.units.forEach(u => {
  ["file", "notes"].forEach(k => {
    if (!fs.existsSync(path.join(C.ROOT, "content", u[k]))) fail("ملف ناقص: content/" + u[k]);
  });
});
console.log("  وحدات: " + manifest.units.length + " · دروس: " + contentIds.size);

/* ---------- الخلاصة ---------- */
console.log("\n" + (errors ? "✗ فيه " + errors + " مشكلة لازم تتصلّح" : "✅ كله سليم") + (warnings ? " · " + warnings + " تنبيه" : ""));
process.exit(errors ? 1 : 0);
