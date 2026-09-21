/* ============================================================================
   runtime/python — الواجهة الوحيدة لتشغيل بايثون
   مسؤولياتها:
     • صف تشغيل: أمر واحد في المرّة، والمهلة بتوقف اللي شغّال بس
     • مهلة تحميل + تعافي لو التحميل فشل (نت مقطوع)
     • وضع احتياطي على الصفحة نفسها لو الـ Worker مش متاح
     • تسخين مبكّر لما الطالب يقرّب من زرار تشغيل
   بتستخدمها المزايا كده:  await run({ kind:"run", code, ns })
   ============================================================================ */

export const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const BOOT_TIMEOUT = 120000;
const WORKER_URL = new URL("./worker.js", import.meta.url);
const HARNESS_URL = new URL("./harness.py", import.meta.url);

const py = {
  worker: null, seq: 0, queue: [], active: null, listeners: [],
  mode: "worker", alive: false, booted: false, warmed: false,
  mainChain: Promise.resolve(), harness: null
};

/* كود بايثون المساعد بيتحمّل مرّة واحدة ويتبعت للخيط.
   في نسخة الملف الواحد بيبقى محقون في الصفحة. */
async function harness() {
  if (py.harness === null) {
    const inline = document.getElementById("py-harness");
    if (inline) py.harness = inline.textContent;
    else {
      const res = await fetch(HARNESS_URL);
      py.harness = res.ok ? await res.text() : "";
    }
  }
  return py.harness;
}

/* الخيط: ملف مستقل في المشروع المقسّم، أو كود محقون في نسخة الملف الواحد */
function workerURL() {
  const inline = document.getElementById("worker-src");
  if (!inline) return WORKER_URL;
  if (!py.blobURL) py.blobURL = URL.createObjectURL(new Blob([inline.textContent], { type: "text/javascript" }));
  return py.blobURL;
}

export function onStatus(fn) {
  py.listeners.push(fn);
  return () => { py.listeners = py.listeners.filter(x => x !== fn); };
}
function emitStatus(text) {
  py.listeners.forEach(fn => { try { fn(text); } catch (e) {} });
}

function dropWorker() {
  if (py.worker) { try { py.worker.terminate(); } catch (e) {} }
  py.worker = null;
  py.booted = false;
}

function finishActive(fn) {
  const job = py.active;
  if (!job) return;
  clearTimeout(job.timer);
  clearTimeout(job.bootTimer);
  py.active = null;
  fn(job);
}

function getWorker() {
  if (py.worker) return py.worker;
  const w = new Worker(workerURL());
  w.onmessage = ev => {
    if (w !== py.worker) return;                   /* رسالة من خيط قديم اتقفل */
    const m = ev.data;
    py.alive = true;
    if (m.type === "status") { emitStatus(m.text); return; }
    const job = py.active;
    if (!job || job.id !== m.id) return;
    if (m.type === "hold") { clearTimeout(job.timer); return; }
    if (m.type === "started") {
      py.booted = true;
      clearTimeout(job.bootTimer);
      clearTimeout(job.timer);
      job.timer = setTimeout(() => kill("timeout"), job.timeout);
      if (job.onStart && !job.startedOnce) { job.startedOnce = true; job.onStart(); }
      return;
    }
    finishActive(j => {
      if (m.error) {
        if (!py.booted) dropWorker();              /* التحميل فشل ← المحاولة الجاية من الأول */
        j.reject({ kind: "error", message: m.error });
      } else j.resolve(m.data);
    });
    pump();
  };
  w.onerror = e => {
    if (w !== py.worker) return;
    if (e.preventDefault) e.preventDefault();
    if (!py.alive) { switchToMain(); return; }
    dropWorker();
    finishActive(j => j.reject({ kind: "error", message: e.message || "worker error" }));
    pump();
  };
  py.worker = w;
  return w;
}

async function pump() {
  if (py.mode === "main" || py.active || !py.queue.length) return;
  const job = py.queue.shift();
  py.active = job;
  try {
    job.msg.harness = await harness();
    const w = getWorker();
    if (!py.booted) job.bootTimer = setTimeout(() => kill("bootTimeout"), BOOT_TIMEOUT);
    w.postMessage(job.msg);
  } catch (e) {
    py.active = null;
    py.queue.unshift(job);
    switchToMain();
  }
}

export function kill(reason) {
  dropWorker();
  emitStatus("");
  finishActive(job => job.reject({ kind: reason || "stopped" }));
  pump();
}

/* ---------- وضع احتياطي: بايثون على الصفحة نفسها ---------- */
let mainPy = null;
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = () => { s.remove(); rej(new Error("Failed to load " + src)); };
    document.head.appendChild(s);
  });
}

async function mainCall(msg) {
  if (!mainPy) {
    emitStatus("⏳ بنحمّل بايثون جوّه الصفحة (أول مرّة بس)…");
    mainPy = (window.loadPyodide ? Promise.resolve() : loadScript(PYODIDE_URL + "pyodide.js"))
      .then(() => window.loadPyodide({ indexURL: PYODIDE_URL }))
      .then(async instance => { instance.runPython(await harness()); return instance; });
    mainPy.catch(() => { mainPy = null; });
  }
  try {
    const instance = await mainPy;
    if (msg.kind === "warm") { emitStatus(""); return {}; }
    const src = msg.code + "\n" + (msg.tests || "");
    await instance.loadPackagesFromImports(src).catch(() => {});
    if (/\bhashlib\b/.test(src) && !mainPy.fullHashlib) {
      try {
        await instance.loadPackage("hashlib");
        instance.runPython("import sys, importlib\nif 'hashlib' in sys.modules: importlib.reload(sys.modules['hashlib'])");
        mainPy.fullHashlib = true;
      } catch (e) {}
    }
    const name = msg.kind === "run" ? "__course_run" : msg.kind === "test" ? "__course_test" : "__course_reset";
    const fn = instance.globals.get(name);
    try {
      const out = msg.kind === "run"
        ? fn(msg.code, msg.stdin || "", msg.ns || "default", msg.files || "[]", msg.filename || "main.py")
        : msg.kind === "test" ? fn(msg.code, msg.tests) : fn(msg.ns || "default");
      return JSON.parse(out);
    } finally {
      if (fn.destroy) fn.destroy();
      emitStatus("");
    }
  } catch (err) {
    emitStatus("");
    throw (err && err.kind) ? err : { kind: "error", message: String((err && err.message) || err) };
  }
}

function mainQueue(job) {
  const p = py.mainChain.then(() => {
    if (job.onStart) job.onStart();
    return mainCall(job.msg);
  });
  py.mainChain = p.catch(() => {});
  p.then(job.resolve, job.reject);
}

export function switchToMain() {
  if (py.mode === "main") return;
  py.mode = "main";
  dropWorker();
  const jobs = (py.active ? [py.active] : []).concat(py.queue);
  if (py.active) { clearTimeout(py.active.timer); clearTimeout(py.active.bootTimer); }
  py.active = null;
  py.queue = [];
  jobs.forEach(mainQueue);
}

/* ---------- الواجهة ---------- */
export function run(msg, opts = {}) {
  msg.url = PYODIDE_URL;
  return new Promise((resolve, reject) => {
    const job = {
      id: ++py.seq, msg, resolve, reject,
      timeout: opts.timeout || 20000, onStart: opts.onStart
    };
    msg.id = job.id;
    if (py.mode === "main") { mainQueue(job); return; }
    py.queue.push(job);
    pump();
  });
}

export function warm() {
  if (py.warmed || py.mode === "main" || py.booted) return;
  py.warmed = true;
  run({ kind: "warm", code: "" }, { timeout: 5000 }).catch(() => { py.warmed = false; });
}

export function watchWarmTriggers() {
  ["pointerover", "focusin", "touchstart"].forEach(ev => {
    document.addEventListener(ev, e => {
      if (e.target.closest && e.target.closest(".run-btn, .edit-btn, .ch-run, .ch-try, .code-editor")) warm();
    }, { passive: true });
  });
  window.addEventListener("online", () => { py.warmed = false; });
}

export function friendlyError(err) {
  err = err || {};
  if (err.kind === "timeout") return "⏱ الكود أخد وقت أطول من اللازم فوقّفناه — غالبًا فيه حلقة ما بتخلصش. راجع شرط الحلقة وجرّب تاني.";
  if (err.kind === "stopped") return "⏹ اتوقّف التشغيل.";
  if (err.kind === "bootTimeout") return "🐢 تحميل بايثون أخد وقت طويل جدًا — اتأكّد من الإنترنت واضغط ▶ تاني.";
  const msg = err.message || "";
  if (!navigator.onLine) return "📴 إنت مش متّصل بالإنترنت — تشغيل الأكواد جوّه الصفحة محتاج إنترنت أول مرّة. اتّصل واضغط ▶ تاني.";
  if (/importScripts|NetworkError|Failed to fetch|Failed to load|load/i.test(msg))
    return "🌐 مش قادرين نحمّل بايثون — تشغيل الأكواد جوّه الصفحة محتاج إنترنت أول مرّة. جرّب تاني بعد شوية. (" + msg + ")";
  return "⚠️ حصلت مشكلة في المشغّل: " + msg + " — جرّب تاني، ولو استمرّت حدّث الصفحة.";
}
