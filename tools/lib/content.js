/* ============================================================================
   tools/lib/content — طبقة وصول واحدة لملفات المحتوى (كل الأدوات بتستخدمها)
     • قراءة وكتابة ملفات الوحدات   content/units/unit-NN.html
     • قراءة وكتابة شرح الأسطر      content/notes/unit-NN.json
     • البحث عن الوحدة اللي فيها درس معيّن
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const UNITS = path.join(ROOT, "content", "units");
const NOTES = path.join(ROOT, "content", "notes");

const unitFiles = () =>
  fs.readdirSync(UNITS).filter(f => /^unit-\d+\.html$/.test(f)).sort();

const unitNum = file => parseInt(file.match(/unit-(\d+)/)[1], 10);
const notesFileFor = file => file.replace(".html", ".json");

function readUnit(file) {
  return fs.readFileSync(path.join(UNITS, file), "utf8");
}
function writeUnit(file, html) {
  fs.writeFileSync(path.join(UNITS, file), html, "utf8");
}
function readNotes(file) {
  const p = path.join(NOTES, notesFileFor(file));
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
}
function writeNotes(file, notes) {
  fs.writeFileSync(path.join(NOTES, notesFileFor(file)), JSON.stringify(notes), "utf8");
}

/* كل الدروس: [{ id, unitFile, html }] */
function lessons() {
  const out = [];
  unitFiles().forEach(file => {
    const html = readUnit(file);
    const re = /<article class="lesson([^"]*)" id="([^"]+)">([\s\S]*?)<\/article>/g;
    let m;
    while ((m = re.exec(html))) out.push({ id: m[2], cls: m[1], body: m[3], unitFile: file });
  });
  return out;
}

/* ملف الوحدة اللي فيه درس أو علامة معيّنة */
function findUnitFile(needle) {
  return unitFiles().find(file => readUnit(file).includes(needle)) || null;
}

/* بلوكات الكود لكل درس: { "u1-l1.1": ["سطر", ...] } */
function codeBlocks() {
  const decode = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const blocks = {};
  lessons().forEach(lesson => {
    const re = /<div class="code"[^>]*>\s*<pre>([\s\S]*?)<\/pre>/g;
    let m, i = 0;
    while ((m = re.exec(lesson.body))) {
      i++;
      blocks[lesson.id + "." + i] = decode(m[1]).replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    }
  });
  return blocks;
}

module.exports = {
  ROOT, UNITS, NOTES,
  unitFiles, unitNum, notesFileFor,
  readUnit, writeUnit, readNotes, writeNotes,
  lessons, findUnitFile, codeBlocks
};
