/* ============================================================================
   runtime/runnability — هل بلوك الكود ده ينفع يتشغّل جوّه المتصفّح؟
   وكمان: إيه الملفات اللي الكود محتاجها (بيانات الدرس + موديولات محلّية).
   ============================================================================ */
import { $, $$ } from "../core/dom.js";

const NOT_PY_FILES = /^(terminal|\.env|\.gitignore|requirements\.txt|pytest\.ini|pyproject\.toml|conftest\.py)$/i;

/* بيرجّع { ok } أو { ok:false, hidden } أو { ok:false, why } */
export function runnability(box, raw) {
  const file = box.dataset.file || "";
  if (box.hasAttribute("data-norun")) return { ok: false, hidden: true };
  if (NOT_PY_FILES.test(file) || (file && !/\.py$/i.test(file))) return { ok: false, hidden: true };
  if (/^<{7}|^={7}$|^>{7}/m.test(raw)) return { ok: false, hidden: true };
  if (/^\s*>>>\s/.test(raw)) return { ok: false, hidden: true };          /* جلسة تفاعلية منسوخة */
  if (/^\s*(pip|python|git|mypy|pytest|cd|mkdir|export|\$env|fastapi|flask)\b/m.test(raw)
      && !/^\s*(def|import|from|print)\b/m.test(raw)) return { ok: false, hidden: true };

  let why = null;
  if (/(^|\/)(test_[^\/]*|[^\/]*_test)\.py$|^tests\//.test(file))
    why = "ملف اختبارات — شغّله على جهازك بـ pytest";
  else if (/\bbreakpoint\s*\(|^\s*import\s+pdb\b|pdb\.set_trace/m.test(raw))
    why = "المنقّح (pdb) محتاج Terminal حقيقي — شغّل الكود على جهازك";
  else if (/^\s*(import|from)\s+(asyncio|threading|multiprocessing|concurrent\.futures|concurrent|httpx|aiohttp)\b|\basyncio\.run\s*\(/m.test(raw))
    why = "التزامن (asyncio والخيوط والعمليات) محتاج بايثون على جهازك — الصفحة بتشغّل الكود جوّه حلقة أحداث واحدة";
  else if (/^\s*(import|from)\s+(gtts|whisper|pytesseract|pdf2image|deep_translator|translate|googletrans|speech_recognition|pyttsx3|pyautogui|selenium|playwright|google\.colab|telebot|telegram|discord|openai|anthropic)\b/m.test(raw))
    why = "المكتبة دي محتاجة جهازك (برامج أو إنترنت أو مفاتيح) — شغّل الكود هناك";
  else if (/^\s*(import|from)\s+(tkinter|pygame|machine)\b/m.test(raw))
    why = "الكود ده بيفتح نافذة أو بيكلّم جهاز — شغّله على جهازك";
  else if (/^\s*(import|from)\s+(flask|fastapi|uvicorn)\b/m.test(raw))
    why = "ده سيرفر ويب — شغّله على جهازك وافتحه من المتصفّح";
  else if (/^\s*import\s+(argparse)\b|sys\.argv/m.test(raw))
    why = "الكود ده بياخد وسائط من الـ Terminal — شغّله على جهازك";
  else if (/^\s*(import|from)\s+(requests|dotenv|pytest)\b|pytest\./m.test(raw))
    why = "الكود ده محتاج جهازك (إنترنت مباشر أو pytest) — شغّله هناك";
  else if (/\bsubprocess\b|\bos\.system\b/.test(raw))
    why = "الكود ده بيشغّل أوامر نظام — شغّله على جهازك";

  return why ? { ok: false, why } : { ok: true };
}

/* اسم الملف اللي هيظهر في رسايل الخطأ */
export function scriptName(box) {
  const f = box.dataset.file || "";
  return /^[\w.-]+\.py$/.test(f) ? f : "main.py";
}

export function importedModules(code) {
  const names = [];
  const re = /^[ \t]*(?:from[ \t]+([\w.]+)[ \t]+import|import[ \t]+([\w., \t]+))/gm;
  let m;
  while ((m = re.exec(code))) {
    if (m[1]) names.push(m[1]);
    else m[2].split(",").forEach(p => { const n = p.trim().split(/\s+/)[0]; if (n) names.push(n); });
  }
  return names;
}

function blockCode(box) {
  const ed = $(".code-editor", box);
  if (ed) return ed.value;
  const pre = $("pre", box);
  if (!pre) return "";
  return pre.dataset.raw !== undefined ? pre.dataset.raw : pre.textContent.replace(/^\n/, "").replace(/\s+$/, "");
}

/* ملفات البيانات المرفقة بالدرس + أي موديول محلّي بيستورده الكود */
export function lessonFiles(lessonId, code, current) {
  const art = document.getElementById(lessonId);
  if (!art) return "[]";
  const files = [];
  $$("script.py-fixture", art).forEach(sc => {
    files.push({ name: sc.dataset.name, content: sc.textContent, seed: true });
  });

  /* لكل اسم ملف: آخر نسخة قبل المثال الحالي، وإلا أول نسخة بعده، وإلا من الوحدة */
  const scope = art.closest(".unit") || art;
  const byName = {};
  let passed = false;
  $$('.code[data-file$=".py"], .code:not([data-file])', scope).forEach(box => {
    if (box === current) { passed = true; return; }
    const fn = box.dataset.file;
    if (!fn) return;
    const inLesson = box.closest(".lesson") === art;
    const rank = inLesson ? (passed ? 1 : 2) : 0;   /* 2 قبله في الدرس · 1 بعده · 0 الوحدة */
    const prev = byName[fn];
    if (!prev || rank > prev.rank || (rank === prev.rank && rank === 2) || (rank === 0 && prev.rank === 0 && !passed))
      byName[fn] = { box, rank };
  });
  Object.keys(byName).forEach(k => { byName[k] = byName[k].box; });

  const seen = {};
  (function walk(src, depth) {
    if (depth > 4) return;
    importedModules(src).forEach(mod => {
      const parts = mod.split(".");
      for (let i = 1; i <= parts.length; i++) {
        const base = parts.slice(0, i).join("/");
        [base + ".py", base + "/__init__.py"].forEach(cand => {
          if (seen[cand] || !byName[cand]) return;
          seen[cand] = true;
          const content = blockCode(byName[cand]);
          files.push({ name: cand, content });
          walk(content, depth + 1);
        });
      }
    });
  })(code, 0);

  return JSON.stringify(files);
}

/* أسئلة input اللي الكود هيسألها — بنعرضها كتلميح فوق خانة المدخلات */
export function inputPrompts(code) {
  const out = [];
  const re = /input\s*\(\s*(?:f?)(["'])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(code))) {
    out.push(m[2]
      .replace(/\\[nrt]/g, " ")
      .replace(/\\(["'\\])/g, "$1")
      .replace(/\{[^}]*\}/g, "…")
      .replace(/\s+/g, " ")
      .trim());
  }
  return out;
}
