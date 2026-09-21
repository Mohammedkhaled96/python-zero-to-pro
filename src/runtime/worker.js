/* ============================================================================
   runtime/worker — بايثون (Pyodide) في خيط منفصل عن الصفحة
   بيستقبل رسائل: warm · run · test · reset، ويرد بـ status / started / hold / result.
   لو الكود دخل في حلقة لا نهائية، الصفحة بتقفل الخيط ده وتفتح واحد جديد.
   ============================================================================ */

let py = null;
let booting = null;
let fullHashlib = false;
const fns = {};

/* أسماء الاستيراد اللي بتختلف عن أسماء الحزم على PyPI */
const PACKAGE_ALIAS = {
  sklearn: "scikit-learn", bs4: "beautifulsoup4", PIL: "pillow",
  yaml: "pyyaml", dotenv: "python-dotenv"
};

const status = text => postMessage({ type: "status", text });

async function boot(url, harness) {
  status("⏳ بنحمّل بايثون جوّه المتصفّح (أول مرّة بس)…");
  importScripts(url + "pyodide.js");
  py = await loadPyodide({ indexURL: url });
  py.runPython(harness);
  ["__course_run", "__course_test", "__course_reset"].forEach(n => { fns[n] = py.globals.get(n); });
}

async function loadPackages(code) {
  const cb = { messageCallback: m => { if (/Loading/.test(m)) status("📦 " + m); } };
  try { await py.loadPackagesFromImports(code, cb); } catch (e) {}
  /* hashlib الكاملة (pbkdf2) مش محمّلة في Pyodide إلا لو طلبناها صراحةً */
  if (/\bhashlib\b/.test(code) && !fullHashlib) {
    try {
      await py.loadPackage("hashlib", cb);
      py.runPython("import sys, importlib\nif 'hashlib' in sys.modules: importlib.reload(sys.modules['hashlib'])");
      fullHashlib = true;
    } catch (e) {}
  }
}

async function pipInstall(mod) {
  const name = PACKAGE_ALIAS[mod] || mod;
  status("📦 بنحمّل " + name + " من PyPI…");
  await py.loadPackage("micropip");
  const micropip = py.pyimport("micropip");
  await micropip.install(name);
}

function call(m) {
  if (m.kind === "warm") return "{}";
  if (m.kind === "run") return fns.__course_run(m.code, m.stdin || "", m.ns || "default", m.files || "[]", m.filename || "main.py");
  if (m.kind === "test") return fns.__course_test(m.code, m.tests);
  return fns.__course_reset(m.ns || "default");
}

self.onmessage = async ev => {
  const m = ev.data;
  try {
    if (!booting) booting = boot(m.url, m.harness);
    await booting;
    if (m.kind !== "warm") await loadPackages(m.code + "\n" + (m.tests || ""));
    postMessage({ type: "started", id: m.id });

    let data = JSON.parse(call(m));
    if (data.missing && m.kind !== "reset") {
      postMessage({ type: "hold", id: m.id });      /* التحميل من PyPI مش محسوب من مهلة التشغيل */
      let installed = false;
      try { await pipInstall(data.missing); installed = true; }
      catch (err) { data.pipError = String((err && err.message) || err); }
      if (installed) {
        postMessage({ type: "started", id: m.id });
        data = JSON.parse(call(m));
      }
    }
    status("");
    postMessage({ type: "result", id: m.id, data });
  } catch (err) {
    status("");
    postMessage({ type: "result", id: m.id, error: String((err && err.message) || err) });
  }
};
