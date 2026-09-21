/* ============================================================================
   tools/build — يبني دروسًا من ملفات مصدر مبسّطة ويحطّها في ملفات المحتوى
     node tools/build.js tools/lessons/my-lesson.src

   الصيغة:
     @@lesson u14-l4 before="<!-- ADD:u14-ch -->"   ← درس جديد كامل
     @@append u10-l1                                 ← إضافة لدرس موجود (قبل الخلاصة)

     @code [file.py] [run] [norun] [solution=ID]
     كود ¦¦ شرح السطر  (`كود` و **عريض** مدعومين)
     @end
     @out [rtl] … @end        الناتج المتوقّع (مع run بيتقارن آليًا بـ tools/runner.js)
     @pre … @end              كود تجهيز للتشغيل الآلي بس
     @stdin … @end            مدخلات للتشغيل الآلي
     @starter ID … @end       كود بداية التحدّي
     @tests ID … @end         اختبارات التحدّي

   قواعد:
     • كل سطر كود لازم له شرح بعد ¦¦
     • السطور الفاضية بتتشال تلقائيًا (الكورس من غير سطور فاضية في الكود)
     • بعد البناء: node tools/reindex.js  ثم  node tools/check.js
   ============================================================================ */
const fs = require("fs");
const path = require("path");
const C = require("./lib/content.js");

const RUN_DIR = path.join(__dirname, "run");
const CH_DIR = path.join(RUN_DIR, "ch");
fs.mkdirSync(CH_DIR, { recursive: true });

const dec = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const esc = s => dec(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const noteHtml = s => {
  s = s.trim();
  if (!s) return "";
  return s.split(/(`[^`]+`)/).map(p => {
    if (/^`[^`]+`$/.test(p)) return "<code class='inl'>" + esc(p.slice(1, -1)) + "</code>";
    return esc(p).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  }).join("");
};

/* بيحوّل جسم المصدر لـ HTML + شرح الأسطر */
function processBody(id, startN, body) {
  const html = [], notes = {};
  let n = startN, i = 0, lastRun = null;

  while (i < body.length) {
    const line = body[i];
    let m;

    if ((m = line.match(/^\s*@code\b(.*)$/))) {
      const opts = m[1].trim().split(/\s+/).filter(Boolean);
      const run = opts.includes("run");
      const norun = opts.includes("norun");
      const solOpt = opts.find(o => o.startsWith("solution="));
      const file = opts.find(o => o !== "run" && o !== "norun" && !o.startsWith("solution="));
      const indent = line.match(/^\s*/)[0];
      const code = [], lineNotes = [];
      i++;
      while (i < body.length && !/^\s*@end\s*$/.test(body[i])) {
        const raw = body[i];
        const k = raw.indexOf("¦¦");
        const c = (k >= 0 ? raw.slice(0, k) : raw).replace(/\s+$/, "");
        const note = k >= 0 ? raw.slice(k + 2) : "";
        if (c.trim() && !note.trim()) { console.error(`[${id}] سطر بدون شرح: ${c}`); process.exit(1); }
        if (c.trim()) { code.push(c); lineNotes.push(noteHtml(note)); }   /* السطور الفاضية بتتشال */
        i++;
      }
      if (i >= body.length) { console.error(`[${id}] @code بدون @end`); process.exit(1); }
      n++;
      notes[id + "." + n] = lineNotes;
      if (run) { fs.writeFileSync(path.join(RUN_DIR, `${id}.${n}.py`), dec(code.join("\n")) + "\n", "utf8"); lastRun = `${id}.${n}`; }
      else lastRun = null;
      if (solOpt) fs.writeFileSync(path.join(CH_DIR, solOpt.slice(9) + ".solution.py"), dec(code.join("\n")) + "\n", "utf8");
      html.push(`${indent}<div class="code"${file ? ` data-file="${file}"` : ""}${norun ? " data-norun" : ""}><pre>\n${esc(code.join("\n"))}\n</pre></div>`);

    } else if ((m = line.match(/^\s*@out\b(.*)$/))) {
      const rtl = m[1].includes("rtl");
      const indent = line.match(/^\s*/)[0];
      const out = [];
      i++;
      while (i < body.length && !/^\s*@end\s*$/.test(body[i])) { out.push(body[i]); i++; }
      if (lastRun) { fs.writeFileSync(path.join(RUN_DIR, lastRun + ".out"), dec(out.join("\n")) + "\n", "utf8"); lastRun = null; }
      html.push(`${indent}<div class="out${rtl ? " rtl" : ""}"><div class="out-head">▸ الناتج</div><pre>${esc(out.join("\n"))}</pre></div>`);

    } else if ((m = line.match(/^\s*@(starter|tests)\s+(\S+)\s*$/))) {
      const kind = m[1], chId = m[2];
      const indent = line.match(/^\s*/)[0];
      const buf = [];
      i++;
      while (i < body.length && !/^\s*@end\s*$/.test(body[i])) { buf.push(body[i]); i++; }
      const text = buf.join("\n").replace(/\s+$/, "") + "\n";
      fs.writeFileSync(path.join(CH_DIR, `${chId}.${kind}.py`), text, "utf8");
      if (kind === "starter") html.push(`${indent}<textarea class="ch-starter" hidden aria-hidden="true">\n${esc(text)}</textarea>`);
      else {
        if (/<\/script/i.test(text)) { console.error(`[${chId}] tests contain </script`); process.exit(1); }
        html.push(`${indent}<script type="text/plain" class="ch-tests">\n${text}</script>`);
      }

    } else if (/^\s*@(stdin|pre)\s*$/.test(line)) {
      const kind = line.trim().slice(1);
      const buf = [];
      i++;
      while (i < body.length && !/^\s*@end\s*$/.test(body[i])) { buf.push(body[i]); i++; }
      fs.writeFileSync(path.join(RUN_DIR, `${id}.${n}` + (kind === "stdin" ? ".stdin" : ".pre.py")), buf.join("\n") + "\n", "utf8");

    } else html.push(line);
    i++;
  }
  while (html.length && !html[html.length - 1].trim()) html.pop();
  return { html, notes, count: n - startN };
}

/* ---------- التنفيذ ---------- */
const files = process.argv.slice(2);
if (!files.length) { console.log("usage: node tools/build.js tools/lessons/file.src"); process.exit(1); }

for (const srcFile of files) {
  const text = fs.readFileSync(srcFile, "utf8").replace(/\r\n/g, "\n");
  const chunks = text.split(/^@@(?=lesson |append )/m).filter(c => c.trim());

  for (const chunk of chunks) {
    const nl = chunk.indexOf("\n");
    const head = chunk.slice(0, nl);
    const body = chunk.slice(nl + 1).split("\n");

    /* ===== إضافة لدرس موجود ===== */
    if (head.startsWith("append ")) {
      const lessonId = head.slice(7).trim();
      const unitFile = C.findUnitFile(`id="${lessonId}"`);
      if (!unitFile) { console.error(`append: الدرس ${lessonId} مش موجود`); process.exit(1); }

      let html = C.readUnit(unitFile);
      const tag = `APPEND:${lessonId}`;
      html = html.replace(new RegExp(`<!-- ${reEsc(tag)} -->[\\s\\S]*?<!-- /${reEsc(tag)} -->\\n?\\s*`), "");

      const open = html.indexOf(`<article class="lesson" id="${lessonId}">`) >= 0
        ? html.indexOf(`<article class="lesson" id="${lessonId}">`)
        : html.indexOf(`id="${lessonId}">`);
      const close = html.indexOf("</article>", open);
      const lessonBody = html.slice(open, close);
      const base = (lessonBody.match(/<div class="code"/g) || []).length;

      const { html: parts, notes, count } = processBody(lessonId, base, body);
      const sumAt = lessonBody.indexOf(`<!-- SUM:${lessonId} -->`);
      const at = sumAt >= 0 ? open + sumAt : close;
      const block = `<!-- ${tag} -->\n${parts.join("\n")}\n    <!-- /${tag} -->\n    `;
      html = html.slice(0, at) + block + html.slice(at);

      C.writeUnit(unitFile, html);
      C.writeNotes(unitFile, Object.assign(C.readNotes(unitFile), notes));
      console.log(`⊕ ${lessonId} (${unitFile}): بلوكات ${base + 1}..${base + count}`);
      continue;
    }

    /* ===== درس جديد ===== */
    const hm = head.match(/^lesson (\S+)\s+before="([^"]+)"/);
    if (!hm) { console.error("سطر عنوان غلط: " + head); process.exit(1); }
    const id = hm[1], anchor = hm[2];

    const unitFile = C.findUnitFile(anchor);
    if (!unitFile) { console.error(`[${id}] العلامة مش موجودة: ${anchor}`); process.exit(1); }
    let html = C.readUnit(unitFile);

    const { html: parts, notes, count } = processBody(id, 0, body);
    const block = `<!-- ADD:${id} -->\n${parts.join("\n")}\n<!-- /ADD:${id} -->\n\n`;
    const existing = new RegExp(`<!-- ADD:${reEsc(id)} -->[\\s\\S]*?<!-- /ADD:${reEsc(id)} -->\\n\\n`);

    if (existing.test(html)) {
      html = html.replace(existing, () => block);
      console.log(`↻ ${id} (${unitFile}): اتحدّث (${count} بلوك)`);
    } else {
      if (html.includes(` id="${id}"`)) { console.error(`id ${id} موجود بالفعل`); process.exit(1); }
      const at = html.indexOf(anchor);
      html = html.slice(0, at) + block + "  " + html.slice(at).replace(/^\s+/, "");
      console.log(`+ ${id} (${unitFile}): اتضاف قبل ${anchor} (${count} بلوك)`);
    }

    C.writeUnit(unitFile, html);
    C.writeNotes(unitFile, Object.assign(C.readNotes(unitFile), notes));
  }
}

console.log("\nخلّص. الخطوة الجاية:  node tools/reindex.js  ثم  node tools/check.js");
