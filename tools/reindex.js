/* ============================================================================
   tools/reindex — بيعيد بناء فهرس الكورس من ملفات المحتوى
     node tools/reindex.js
   شغّله بعد أي تعديل على content/units/*.html:
     • بيحدّث content/course.json  (الوحدات والدروس والأوقات والإحصائيات)
     • بيحدّث content/search-index.json
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const UNITS_DIR = path.join(ROOT, "content", "units");
const decode = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const files = fs.readdirSync(UNITS_DIR).filter(f => /^unit-\d+\.html$/.test(f)).sort();
const units = [];
const searchIndex = {};

files.forEach(file => {
  const num = parseInt(file.match(/unit-(\d+)/)[1], 10);
  const inner = fs.readFileSync(path.join(UNITS_DIR, file), "utf8");
  const title = (inner.match(/<div class="unit-head">[\s\S]*?<h2>([\s\S]*?)<\/h2>/) || [])[1] || "وحدة " + num;
  const kicker = (inner.match(/<div class="kicker">([\s\S]*?)<\/div>/) || [])[1] || "";

  const lessons = [];
  let codeTotal = 0, challengeTotal = 0;
  const lessonRe = /<article class="lesson([^"]*)" id="([^"]+)">([\s\S]*?)<\/article>/g;
  let l;
  while ((l = lessonRe.exec(inner))) {
    const cls = l[1], id = l[2], body = l[3];
    const h3 = (body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || id;
    const lessonTitle = h3.replace(/<span class="tag">[\s\S]*?<\/span>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const code = (body.match(/<div class="code"/g) || []).length;
    const challenges = (body.match(/class="challenge"/g) || []).length;
    codeTotal += code;
    challengeTotal += challenges;

    /* تقدير وقت الدرس: قراءة + كود + أسئلة + تمارين + تحدّيات */
    const codeText = (body.match(/<div class="code"[^>]*><pre>[\s\S]*?<\/pre>/g) || []).join("\n");
    const codeLines = codeText.split("\n").length;
    const codeWords = codeText.split(/\s+/).length;
    const words = Math.max(0, body.replace(/<[^>]+>/g, " ").split(/\s+/).length - codeWords);
    const quizzes = (body.match(/class="q" data-a=/g) || []).length;
    const exercises = (body.match(/class="ex"/g) || []).length;
    const mins = words / 130 + codeLines * 0.2 + quizzes * 0.4 + exercises * 4 + challenges * 8;

    lessons.push({
      id, title: lessonTitle,
      project: /project/.test(cls),
      minutes: Math.max(5, Math.ceil(mins / 5) * 5),
      code, challenges
    });

    searchIndex[id] = decode(body.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ").trim().toLowerCase();
  }

  units.push({
    id: "unit-" + num, num,
    title: title.replace(/<[^>]+>/g, "").trim(),
    kicker: kicker.replace(/<[^>]+>/g, "").trim(),
    file: "units/" + file,
    notes: "notes/" + file.replace(".html", ".json"),
    chars: inner.length,
    code: codeTotal,
    challenges: challengeTotal,
    minutes: lessons.reduce((a, x) => a + x.minutes, 0),
    lessons
  });
});

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

fs.writeFileSync(path.join(ROOT, "content", "course.json"), JSON.stringify(manifest, null, 1), "utf8");
fs.writeFileSync(path.join(ROOT, "content", "search-index.json"), JSON.stringify(searchIndex), "utf8");
console.log("✓ الفهرس اتحدّث:", JSON.stringify(manifest.stats));
