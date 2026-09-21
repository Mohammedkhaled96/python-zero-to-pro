/* ============================================================================
   ترحيل لمرّة واحدة: من ملف واحد ضخم ← هيكل مشروع مقسّم
   بيقرا python-course.html القديم ويطلّع:
     content/course.json       فهرس الوحدات والدروس والإحصائيات
     content/units/unit-NN.html   محتوى كل وحدة
     content/notes/unit-NN.json   شرح الأسطر لدروس الوحدة
     content/search-index.json    نص كل درس للبحث (بيتحمّل عند أول بحث)
     assets/css/*.css             الأنماط مقسّمة بطبقاتها
     src/runtime/harness.py       كود بايثون المساعد
     tools/legacy/engine.js       المحرّك القديم (مرجع وقت التقسيم)
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_HTML = process.argv[2] || path.resolve(ROOT, "..", "python-course.html");
const html = fs.readFileSync(SRC_HTML, "utf8");

const write = (rel, data) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data, "utf8");
  return { rel, kb: Math.round(Buffer.byteLength(data) / 1024) };
};
const log = [];
const decode = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const pad = n => String(n).padStart(2, "0");

/* ---------- 1) الأنماط ---------- */
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const cssLines = css.split("\n");
const slice = (from, to) => cssLines.slice(from - 1, to).join("\n").replace(/^\s*\n/, "").replace(/\s+$/, "") + "\n";
/* @media print بيتجمّع في ملف لوحده */
const printBlocks = [];
let body = slice(1, cssLines.length);
body = body.replace(/@media print\s*\{[\s\S]*?\n\}/g, m => { printBlocks.push(m); return ""; });
const cssNoPrint = body.split("\n");
const cutAt = (marker) => cssNoPrint.findIndex(l => l.includes(marker)) + 1;
const layoutStart = cutAt("#shell{");
const contentStart = cssNoPrint.findIndex(l => /^\.unit\{/.test(l)) + 1;
const componentsStart = cssNoPrint.findIndex(l => l.includes("جدول شرح الكود سطرًا بسطر")) + 1;
const part = (a, b) => cssNoPrint.slice(a - 1, b ? b - 1 : undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";

log.push(write("assets/css/tokens.css", "/* المتغيّرات والثيم — كل الألوان والخطوط من هنا */\n" + part(1, layoutStart)));
log.push(write("assets/css/layout.css", "/* هيكل الصفحة: الشريط الجانبي، الرأس، المحتوى، التذييل */\n" + part(layoutStart, contentStart)));
log.push(write("assets/css/content.css", "/* محتوى الدروس: العناوين، الصناديق، الكود، الجداول */\n" + part(contentStart, componentsStart)));
log.push(write("assets/css/components.css", "/* مكوّنات تفاعلية: الاختبارات، التحدّيات، لوحة التقدّم، النوافذ */\n" + part(componentsStart)));
log.push(write("assets/css/print.css", "/* الطباعة */\n" + printBlocks.join("\n\n") + "\n"));

/* ---------- 2) الأيقونة ---------- */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#4da3ff"/><text x="50" y="68" font-size="52" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">Py</text></svg>\n`;
log.push(write("assets/favicon.svg", favicon));

/* ---------- 3) شرح الأسطر ---------- */
const notesSrc = html.match(/var LINE_NOTES = \{\};([\s\S]*?)\/\* NOTES-END \*\//)[1];
const LINE_NOTES = new Function("LINE_NOTES", "Object", notesSrc + "; return LINE_NOTES;")({}, Object);

/* ---------- 4) الوحدات ---------- */
const units = [];
const tplRe = /<template id="tpl-unit-(\d+)">([\s\S]*?)<\/template>/g;
let m;
while ((m = tplRe.exec(html))) {
  const num = +m[1];
  let inner = m[2].replace(/<!-- UNIT-END:\d+ -->\s*$/, "").replace(/^\n/, "").replace(/\s+$/, "");
  const head = inner.match(/<div class="unit-head">([\s\S]*?)<\/div>/);
  const title = (inner.match(/<div class="unit-head">[\s\S]*?<h2>([\s\S]*?)<\/h2>/) || [])[1] || ("وحدة " + num);
  const kicker = (inner.match(/<div class="kicker">([\s\S]*?)<\/div>/) || [])[1] || "";

  const lessons = [];
  const lessonRe = /<article class="lesson([^"]*)" id="([^"]+)">([\s\S]*?)<\/article>/g;
  let l, codeTotal = 0, challengeTotal = 0;
  while ((l = lessonRe.exec(inner))) {
    const cls = l[1], id = l[2], b = l[3];
    const h3 = (b.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || id;
    const lessonTitle = h3.replace(/<span class="tag">[\s\S]*?<\/span>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const codeBlocks = (b.match(/<div class="code"/g) || []).length;
    const challenges = (b.match(/class="challenge"/g) || []).length;
    codeTotal += codeBlocks;
    challengeTotal += challenges;
    /* نفس معادلة تقدير الوقت اللي كانت في المحرّك */
    const codeText = (b.match(/<div class="code"[^>]*><pre>[\s\S]*?<\/pre>/g) || []).join("\n");
    const codeLines = codeText.split("\n").length;
    const codeWords = codeText.split(/\s+/).length;
    const words = Math.max(0, b.replace(/<[^>]+>/g, " ").split(/\s+/).length - codeWords);
    const quizzes = (b.match(/class="q" data-a=/g) || []).length;
    const exercises = (b.match(/class="ex"/g) || []).length;
    const mins = words / 130 + codeLines * 0.2 + quizzes * 0.4 + exercises * 4 + challenges * 8;
    lessons.push({
      id,
      title: lessonTitle,
      project: /project/.test(cls),
      minutes: Math.max(5, Math.ceil(mins / 5) * 5),
      code: codeBlocks,
      challenges
    });
  }

  const file = `units/unit-${pad(num)}.html`;
  const notesFile = `notes/unit-${pad(num)}.json`;
  log.push(write("content/" + file, inner + "\n"));

  const unitNotes = {};
  Object.keys(LINE_NOTES).forEach(key => {
    const lessonId = key.slice(0, key.lastIndexOf("."));
    if (lessons.some(x => x.id === lessonId)) unitNotes[key] = LINE_NOTES[key];
  });
  log.push(write("content/" + notesFile, JSON.stringify(unitNotes)));

  units.push({
    id: "unit-" + num, num, title: title.replace(/<[^>]+>/g, "").trim(), kicker: kicker.replace(/<[^>]+>/g, "").trim(),
    file, notes: notesFile, chars: inner.length,
    code: codeTotal, challenges: challengeTotal,
    minutes: lessons.reduce((a, x) => a + x.minutes, 0),
    lessons
  });
}

/* ---------- 5) المانيفست ---------- */
const all = units.flatMap(u => u.lessons);
const manifest = {
  title: "كورس بايثون الشامل — من الصفر إلى الاحتراف",
  author: "Mohammed Khaled",
  generated: new Date().toISOString().slice(0, 10),
  stats: {
    units: units.length,
    lessons: all.filter(l => /-l\d+$/.test(l.id)).length,
    projects: all.filter(l => l.project).length,
    code: units.reduce((a, u) => a + u.code, 0),
    challenges: units.reduce((a, u) => a + u.challenges, 0),
    hours: Math.round(units.reduce((a, u) => a + u.minutes, 0) / 60)
  },
  units
};
log.push(write("content/course.json", JSON.stringify(manifest, null, 1)));

/* ---------- 6) فهرس البحث (بيتحمّل عند أول بحث) ---------- */
const index = {};
units.forEach(u => {
  const unitHtml = fs.readFileSync(path.join(ROOT, "content", u.file), "utf8");
  const lessonRe = /<article class="lesson[^"]*" id="([^"]+)">([\s\S]*?)<\/article>/g;
  let l;
  while ((l = lessonRe.exec(unitHtml))) {
    index[l[1]] = decode(l[2].replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ").trim().toLowerCase();
  }
});
log.push(write("content/search-index.json", JSON.stringify(index)));

/* ---------- 7) كود بايثون المساعد + المحرّك القديم للمرجع ---------- */
const harness = html.match(/<script type="text\/plain" id="py-harness">\n([\s\S]*?)<\/script>/)[1];
log.push(write("src/runtime/harness.py", harness));
const engine = html.match(/\/\* ENGINE-START \*\/\n([\s\S]*?)\/\* ENGINE-END \*\//)[1];
log.push(write("tools/legacy/engine.js", engine));
const hl = html.match(/(\/\* =+ Python syntax highlighter[\s\S]*?\n\}\)\(\);)/)[1];
log.push(write("tools/legacy/highlight.js", hl));

/* ---------- تقرير ---------- */
console.log("الوحدات:", units.length, "· الدروس:", all.length, "· الإحصائيات:", JSON.stringify(manifest.stats));
console.log("\nالملفات اللي اتعملت:");
log.forEach(f => console.log("  " + f.rel.padEnd(34) + f.kb + " KB"));
