/* بيشغّل بلوكات run ويقارن الناتج بالـ @out اللي بعدها.
   node runner.js [prefix]   مثال: node runner.js u2-l4
   - الملفات بتتشغّل بالترتيب جوّه نفس الدرس في فولدر مشترك (عشان الملفات المكتوبة).
   - لو فيه ملف <key>.stdin بيتبعت كمدخل.
   - ملف <key>.pre.py (اختياري) بيتضاف قبل الكود (لتعريفات سابقة). */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const RUN_DIR = path.join(__dirname, "run");
const prefix = process.argv[2] || "";
const keys = fs.readdirSync(RUN_DIR).filter(f => /\.py$/.test(f) && !/\.pre\.py$/.test(f) && f.startsWith(prefix))
  .map(f => f.replace(/\.py$/, ""))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

const norm = s => s.replace(/\r\n/g, "\n").split("\n").map(l => l.replace(/\s+$/, "")).join("\n").replace(/\s+$/, "");
let pass = 0, fail = 0, noexp = 0;
for (const k of keys) {
  const lesson = k.replace(/\.\d+$/, "");
  const work = path.join(RUN_DIR, "work", lesson);
  fs.mkdirSync(work, { recursive: true });
  let code = fs.readFileSync(path.join(RUN_DIR, k + ".py"), "utf8");
  const pre = path.join(RUN_DIR, k + ".pre.py");
  if (fs.existsSync(pre)) code = fs.readFileSync(pre, "utf8") + "\n" + code;
  const file = path.join(work, "_run.py");
  fs.writeFileSync(file, code, "utf8");
  const stdinF = path.join(RUN_DIR, k + ".stdin");
  const r = spawnSync("python", ["-X", "utf8", file], {
    cwd: work, encoding: "utf8", timeout: 60000,
    input: fs.existsSync(stdinF) ? fs.readFileSync(stdinF, "utf8") : "",
    env: Object.assign({}, process.env, { PYTHONIOENCODING: "utf-8", PYTHONHASHSEED: "0" })
  });
  const out = (r.stdout || "").replace(/\s+$/, "");
  const got = norm(out + (r.stderr ? (out ? "\n" : "") + r.stderr : ""))
    .replace(/File "[^"]*_run\.py"/g, 'File "main.py"');
  const expF = path.join(RUN_DIR, k + ".out");
  if (!fs.existsSync(expF)) { noexp++; console.log(`• ${k} (بدون ناتج متوقّع)\n${got.split("\n").map(l => "    " + l).join("\n")}`); continue; }
  const exp = norm(fs.readFileSync(expF, "utf8"));
  if (exp === got) { pass++; console.log(`✓ ${k}`); }
  else {
    fail++;
    console.log(`✗ ${k}`);
    const e = exp.split("\n"), g = got.split("\n");
    for (let i = 0; i < Math.max(e.length, g.length); i++) {
      if (e[i] !== g[i]) console.log(`    line ${i + 1}\n      expected: ${e[i]}\n      got     : ${g[i]}`);
    }
  }
}
console.log(`\n${pass} ✓ / ${fail} ✗ / ${noexp} بدون مقارنة`);
process.exit(fail ? 1 : 0);
