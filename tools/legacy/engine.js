/* ================= Course App (lazy units · resume · in-browser Python) ============== */
(function(){
"use strict";

/* ---------- التخزين المحلّي (آمن لو المتصفّح مانعه) ---------- */
var K = {
  done: "py-course-done-v1",
  theme: "py-course-theme",
  last: "py-course-last-v1",
  quiz: "py-course-quiz-v1",
  ch: "py-course-challenges-v1",
  cp: "py-course-checkpoints-v1",
  edits: "py-course-edits-v1",
  fb: "py-course-feedback-v1",
  time: "py-course-time-v1"
};
var storageWarned = false;
function storageFailed(e){
  if(storageWarned) return;
  storageWarned = true;
  if(window.console) console.warn("localStorage:", e);
  setTimeout(function(){
    toast("⚠️ المتصفّح مش سامح بحفظ تقدّمك (وضع التصفّح الخفي أو المساحة مليانة). الكورس شغّال عادي، بس التقدّم مش هيتحفظ — استخدم «📤 تصدير تقدّمي» عشان ما يضيعش.", [], 12000);
  }, 0);
}
var LS = {
  get: function(k, d){ try{ var v = localStorage.getItem(k); if(v === null) return d; var p = JSON.parse(v); return (p === null || typeof p !== typeof d && d !== null) ? d : p; }catch(e){ return d; } },
  set: function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ storageFailed(e); } },
  raw: function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  setRaw: function(k, v){ try{ localStorage.setItem(k, v); }catch(e){} },
  del: function(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
var state = {
  done: LS.get(K.done, {}),
  quiz: LS.get(K.quiz, {}),
  ch: LS.get(K.ch, {}),
  cp: LS.get(K.cp, {}),
  edits: LS.get(K.edits, {}),
  fb: LS.get(K.fb, {}),
  time: LS.get(K.time, {})
};
function save(name){ clearTimeout(saveTimers[name]); delete saveTimers[name]; LS.set(K[name], state[name]); }
/* حفظ مؤجَّل للكتابة المستمرّة (المحرّر والمدخلات) بدل الحفظ مع كل حرف */
var saveTimers = {};
function saveSoon(name){
  clearTimeout(saveTimers[name]);
  saveTimers[name] = setTimeout(function(){ save(name); }, 400);
}
function flushSaves(){ Object.keys(saveTimers).forEach(save); }

/* لو حصل خطأ في جزء واحد من الصفحة، الباقي يكمّل عادي */
function eachSafe(list, fn){
  list.forEach(function(item, i){
    try{ fn(item, i); }
    catch(err){ if(window.console) console.error("[course]", item && item.id || "", err); }
  });
}
function safeDecode(s){ try{ return decodeURIComponent(s); }catch(e){ return s; } }
function instantScrollBy(y){ if(y) window.scrollBy({ top: y, left: 0, behavior: "instant" }); }
function jumpTo(node){ node.scrollIntoView({ block: "start", behavior: "instant" }); }

function $(sel, root){ return (root || document).querySelector(sel); }
function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function el(tag, cls, html){
  var e = document.createElement(tag);
  if(cls) e.className = cls;
  if(html !== undefined) e.innerHTML = html;
  return e;
}
/* بنكتب في الصفحة بس لو القيمة اتغيّرت — كل كتابة بتكلّف إعادة ترتيب الصفحة */
function setText(node, v){ if(node && node.textContent !== v) node.textContent = v; }
function escHTML(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function h3Title(h3){ return h3 ? h3.childNodes[0].textContent.trim() : ""; }

/* ================================================================
   1) نموذج البيانات: الوحدات من القوالب (من غير ما نرسمها)
   ================================================================ */
var units = [];
var lessonIndex = {};           /* id → {unit, title, project, minutes} */

function estimateMinutes(ls){
  var text = ls.textContent || "";
  var codeWords = 0, codeLines = 0;
  $$(".code pre", ls).forEach(function(p){
    var t = p.textContent.trim();
    codeLines += t ? t.split("\n").length : 0;
    codeWords += t ? t.split(/\s+/).length : 0;
  });
  var words = Math.max(0, text.split(/\s+/).length - codeWords);
  var mins = words / 130 +
             codeLines * 0.2 +
             $$(".quiz .q", ls).length * 0.4 +
             $$(".ex", ls).length * 4 +
             $$(".challenge", ls).length * 8;
  return Math.max(5, Math.ceil(mins / 5) * 5);
}

$$("section.unit").forEach(function(sec){
  var tpl = document.getElementById("tpl-" + sec.id);
  var frag = tpl ? tpl.content : sec;
  var h2 = frag.querySelector(".unit-head h2");
  var kicker = frag.querySelector(".unit-head .kicker");
  var u = {
    id: sec.id, num: sec.dataset.num, sec: sec, tpl: tpl, frag: frag,
    title: h2 ? h2.textContent.trim() : sec.id,
    kicker: kicker ? kicker.textContent.trim() : "",
    loaded: !tpl, lessons: [], minutes: 0,
    chars: tpl ? tpl.innerHTML.length : 0
  };
  $$(".lesson", frag).forEach(function(ls){
    var info = {
      id: ls.id, unit: u,
      title: h3Title($("h3", ls)),
      project: ls.classList.contains("project"),
      minutes: estimateMinutes(ls),
      node: ls, text: null
    };
    u.minutes += info.minutes;
    u.lessons.push(info);
    lessonIndex[ls.id] = info;
  });
  units.push(u);
});
var allLessons = [];
units.forEach(function(u){ allLessons = allLessons.concat(u.lessons); });

/* نسبة بكسل/حرف لتقدير ارتفاع الوحدات اللي لسه ما اترسمتش — بتتعلّم من اللي اترسم */
var ratio = { px: 0, chars: 0 };
function estHeight(u){
  var r = ratio.chars > 20000 ? ratio.px / ratio.chars : 0.3;
  return Math.max(500, Math.round(u.chars * r));
}

function paintPlaceholder(u){
  u.sec.innerHTML =
    '<div class="unit-ph" aria-busy="true">' +
      '<div class="kicker">' + escHTML(u.kicker) + '</div>' +
      '<h2>' + escHTML(u.title) + '</h2>' +
      '<p>⏳ الوحدة بتتجهّز…</p>' +
    '</div>';
  u.sec.style.minHeight = estHeight(u) + "px";
}

function unitForId(id){
  for(var i = 0; i < units.length; i++){
    var u = units[i];
    if(u.id === id) return u;
    if(!u.loaded && u.frag.getElementById && u.frag.getElementById(id)) return u;
  }
  var base = id.replace(/-p\d+$/, "");
  return lessonIndex[base] ? lessonIndex[base].unit : null;
}

/* نقطة تثبيت: أول عنصر واصل لأعلى الشاشة وإحنا برّه الوحدة اللي هترسم.
   بنقيس مكانه قبل الرسم وبعده، ونصحّح التمرير بالفرق — عشان اللي الطالب بيقراه
   ما يتزحلقش لما وحدة فوقه تتحمّل (ده كان بيوديه لمكان تاني بعد الضغط على الفهرس). */
function scrollAnchor(skipSec){
  if(window.scrollY < 5) return null;
  var list = $$("section.unit, .unit:not([data-lazy]) .lesson");
  for(var i = 0; i < list.length; i++){
    var node = list[i];
    if(skipSec && (node === skipSec || skipSec.contains(node))) continue;
    var r = node.getBoundingClientRect();
    if(r.bottom > 0) return { node: node, top: r.top };
  }
  return null;
}
function keepAnchor(a){
  if(!a || !a.node.isConnected) return;
  var delta = a.node.getBoundingClientRect().top - a.top;
  if(Math.abs(delta) > 0.5) instantScrollBy(delta);
}

function renderUnit(u, opts){
  if(u.loaded) return;
  opts = opts || {};
  var anchor = opts.noAdjust ? null : scrollAnchor(u.sec);
  u.sec.innerHTML = "";
  u.sec.appendChild(u.tpl.content.cloneNode(true));
  u.sec.style.minHeight = "";
  u.sec.removeAttribute("data-lazy");
  u.loaded = true;
  try{ enhance(u.sec, u); }
  catch(err){ if(window.console) console.error("[course] unit", u.id, err); }
  var h = u.sec.getBoundingClientRect().height;
  ratio.px += h; ratio.chars += u.chars;
  keepAnchor(anchor);
  lazyIO.unobserve(u.sec);
  refreshTocState();
}

function renderAll(){
  units.forEach(function(u){ renderUnit(u); });
}

var lazyIO = ("IntersectionObserver" in window) ? new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    var u = units.filter(function(x){ return x.sec === e.target; })[0];
    if(u && !u.loaded) renderUnit(u);
  });
}, { rootMargin: "1200px 0px 1200px 0px" }) : { observe: function(){}, unobserve: function(){} };

/* ================================================================
   2) التنقّل: أي رابط داخلي بيحمّل وحدته الأول
   ================================================================ */
/* بعد أي قفزة: نفضل مثبّتين الهدف لمدّة قصيرة لحد ما الصفحة تستقرّ.
   أي تحرّك من الطالب (عجلة الماوس، لمس، مفتاح) بيلغي التثبيت فورًا. */
var navPin = { node: null, want: 0, until: 0 };
function pinNav(node){
  navPin = { node: node, want: node.getBoundingClientRect().top, until: Date.now() + 1600 };
  var tries = 0;
  (function step(){
    if(!navPin.node || navPin.node !== node || Date.now() > navPin.until) return;
    if(!node.isConnected) return;
    var delta = node.getBoundingClientRect().top - navPin.want;
    if(Math.abs(delta) > 1) instantScrollBy(delta);
    tries++;
    setTimeout(step, tries < 4 ? 60 : 250);
  })();
}
["wheel", "touchstart", "mousedown", "keydown"].forEach(function(ev){
  window.addEventListener(ev, function(){ navPin.until = 0; }, { passive: true });
});

function goTo(id, extraOffset){
  var u = unitForId(id);
  if(u && !u.loaded) renderUnit(u, { noAdjust: true });
  var target = document.getElementById(id);
  if(!target) return false;
  /* لو الهدف جوّه تفاصيل مقفولة (زي حل تمرين) نفتحها */
  var d = target.closest && target.closest("details:not([open])");
  if(d) d.open = true;
  jumpTo(target);
  instantScrollBy(extraOffset);
  pinNav(target);
  syncCurrent();
  return true;
}

document.addEventListener("click", function(e){
  if(e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if(!a) return;
  var id = safeDecode(a.getAttribute("href").slice(1));
  if(!id) return;
  e.preventDefault();
  var go = function(){
    document.documentElement.classList.remove("unit-loading");
    if(goTo(id)){
      try{ history.replaceState(null, "", "#" + encodeURIComponent(id)); }catch(err){}
    }
  };
  var u = unitForId(id);
  if(u && !u.loaded && !document.hidden){
    /* الوحدة لسه ما اترسمتش: نوري مؤشّر الأول وبعدين نرسم */
    document.documentElement.classList.add("unit-loading");
    setText(crumb, "⏳ بنجهّز " + u.title + "…");
    var ran = false;
    var once = function(){ if(!ran){ ran = true; go(); } };
    requestAnimationFrame(function(){ setTimeout(once, 0); });
    setTimeout(once, 150);   /* احتياطي لو المتصفّح ما رسمش فريم */
  } else go();
});
window.addEventListener("hashchange", function(){
  var id = safeDecode(location.hash.slice(1));
  if(id) goTo(id);
});

/* ================================================================
   3) مشغّل بايثون في المتصفّح (Pyodide داخل Web Worker)
   ================================================================ */
var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

function workerMain(){
  var py = null, booting = null, fns = {};
  var MAP = { sklearn: "scikit-learn", bs4: "beautifulsoup4", PIL: "pillow", yaml: "pyyaml", dotenv: "python-dotenv" };
  function status(t){ postMessage({ type: "status", text: t }); }
  async function boot(url, harness){
    status("⏳ بنحمّل بايثون جوّه المتصفّح (أول مرّة بس)…");
    importScripts(url + "pyodide.js");
    py = await loadPyodide({ indexURL: url });
    py.runPython(harness);
    ["__course_run", "__course_test", "__course_reset"].forEach(function(n){ fns[n] = py.globals.get(n); });
  }
  async function packages(code){
    var cb = { messageCallback: function(m){ if(/Loading/.test(m)) status("📦 " + m); } };
    try{ await py.loadPackagesFromImports(code, cb); }catch(e){}
    /* مكتبات قياسية ناقصة في Pyodide إلا لو اتحمّلت صراحةً */
    if(/\bhashlib\b/.test(code) && !fullHashlib){
      try{
        await py.loadPackage("hashlib", cb);
        py.runPython("import sys, importlib\nif 'hashlib' in sys.modules: importlib.reload(sys.modules['hashlib'])");
        fullHashlib = true;
      }catch(e){}
    }
  }
  var fullHashlib = false;
  async function pipInstall(mod){
    var name = MAP[mod] || mod;
    status("📦 بنحمّل " + name + " من PyPI…");
    await py.loadPackage("micropip");
    var micropip = py.pyimport("micropip");
    await micropip.install(name);
  }
  function call(m){
    if(m.kind === "warm") return "{}";
    if(m.kind === "run") return fns.__course_run(m.code, m.stdin || "", m.ns || "default", m.files || "[]", m.filename || "main.py");
    if(m.kind === "test") return fns.__course_test(m.code, m.tests);
    return fns.__course_reset(m.ns || "default");
  }
  self.onmessage = async function(ev){
    var m = ev.data;
    try{
      if(!booting) booting = boot(m.url, m.harness);
      await booting;
      if(m.kind !== "warm") await packages(m.code + "\n" + (m.tests || ""));
      postMessage({ type: "started", id: m.id });
      var data = JSON.parse(call(m));
      if(data.missing && m.kind !== "reset"){
        postMessage({ type: "hold", id: m.id });      /* التحميل من PyPI مش محسوب من مهلة التشغيل */
        var installed = false;
        try{ await pipInstall(data.missing); installed = true; }
        catch(err){ data.pipError = String(err && err.message || err); }
        if(installed){
          postMessage({ type: "started", id: m.id });
          data = JSON.parse(call(m));
        }
      }
      status("");
      postMessage({ type: "result", id: m.id, data: data });
    }catch(err){
      status("");
      postMessage({ type: "result", id: m.id, error: String(err && err.message || err) });
    }
  };
}

var PY = { worker: null, seq: 0, queue: [], active: null, listeners: [], mode: "worker",
           alive: false, booted: false, warmed: false, mainChain: Promise.resolve() };
var BOOT_TIMEOUT = 120000;   /* أول تحميل لبايثون على نت بطيء */
var harnessSrc = ($("#py-harness") || { textContent: "" }).textContent;

function pyStatus(text){ PY.listeners.forEach(function(fn){ try{ fn(text); }catch(e){} }); }

function dropWorker(){
  if(PY.worker){ try{ PY.worker.terminate(); }catch(e){} }
  PY.worker = null;
  PY.booted = false;
}

function finishActive(fn){
  var job = PY.active;
  if(!job) return;
  clearTimeout(job.timer); clearTimeout(job.bootTimer);
  PY.active = null;
  fn(job);
}

function pyWorker(){
  if(PY.worker) return PY.worker;
  var blob = new Blob(["(" + workerMain.toString() + ")()"], { type: "text/javascript" });
  var url = URL.createObjectURL(blob);
  var w = new Worker(url);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 10000);
  w.onmessage = function(ev){
    if(w !== PY.worker) return;               /* رسالة من Worker قديم اتقفل */
    var m = ev.data;
    PY.alive = true;
    if(m.type === "status"){ pyStatus(m.text); return; }
    var job = PY.active;
    if(!job || job.id !== m.id) return;
    if(m.type === "hold"){ clearTimeout(job.timer); return; }
    if(m.type === "started"){
      PY.booted = true;
      clearTimeout(job.bootTimer);
      clearTimeout(job.timer);
      job.timer = setTimeout(function(){ pyKill("timeout"); }, job.timeout);
      if(job.onStart && !job.startedOnce){ job.startedOnce = true; job.onStart(); }
      return;
    }
    finishActive(function(j){
      if(m.error){
        if(!PY.booted) dropWorker();          /* التحميل فشل ← المحاولة الجاية تبدأ من الأول */
        j.reject({ kind: "error", message: m.error });
      } else j.resolve(m.data);
    });
    pump();
  };
  w.onerror = function(e){
    if(w !== PY.worker) return;
    if(e.preventDefault) e.preventDefault();
    if(!PY.alive){ switchToMain(); return; }
    dropWorker();
    finishActive(function(j){ j.reject({ kind: "error", message: e.message || "worker error" }); });
    pump();
  };
  PY.worker = w;
  return w;
}

/* تشغيل واحد في المرّة: المهلة بتوقف اللي شغّال بس، والباقي يكمّل بعده */
function pump(){
  if(PY.mode === "main" || PY.active || !PY.queue.length) return;
  var job = PY.queue.shift();
  PY.active = job;
  try{
    var w = pyWorker();
    if(!PY.booted) job.bootTimer = setTimeout(function(){ pyKill("bootTimeout"); }, BOOT_TIMEOUT);
    w.postMessage(job.msg);
  }catch(e){
    PY.active = null;
    PY.queue.unshift(job);
    switchToMain();
  }
}

function pyKill(reason){
  dropWorker();
  pyStatus("");
  finishActive(function(j){ j.reject({ kind: reason || "stopped" }); });
  pump();
}

/* ---------- وضع احتياطي: بايثون على الصفحة نفسها لو الـ Worker ما اشتغلش ---------- */
var mainPy = null;
function loadScript(src){
  return new Promise(function(res, rej){
    var s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = function(){ s.remove(); rej(new Error("Failed to load " + src)); };
    document.head.appendChild(s);
  });
}
function mainCall(msg){
  if(!mainPy){
    pyStatus("⏳ بنحمّل بايثون جوّه الصفحة (أول مرّة بس)…");
    mainPy = (window.loadPyodide ? Promise.resolve() : loadScript(PYODIDE_URL + "pyodide.js")).then(function(){
      return window.loadPyodide({ indexURL: PYODIDE_URL });
    }).then(function(py){ py.runPython(harnessSrc); return py; });
    mainPy.catch(function(){ mainPy = null; });
  }
  return mainPy.then(function(py){
    if(msg.kind === "warm"){ pyStatus(""); return {}; }
    var src = msg.code + "\n" + (msg.tests || "");
    return py.loadPackagesFromImports(src).catch(function(){}).then(function(){
      if(!/\bhashlib\b/.test(src) || mainPy.fullHashlib) return null;
      return py.loadPackage("hashlib").then(function(){
        py.runPython("import sys, importlib\nif 'hashlib' in sys.modules: importlib.reload(sys.modules['hashlib'])");
        mainPy.fullHashlib = true;
      }).catch(function(){});
    }).then(function(){
      var name = msg.kind === "run" ? "__course_run" : msg.kind === "test" ? "__course_test" : "__course_reset";
      var fn = py.globals.get(name);
      try{
        var out = msg.kind === "run" ? fn(msg.code, msg.stdin || "", msg.ns || "default", msg.files || "[]", msg.filename || "main.py")
                : msg.kind === "test" ? fn(msg.code, msg.tests) : fn(msg.ns || "default");
        return JSON.parse(out);
      } finally {
        if(fn.destroy) fn.destroy();
        pyStatus("");
      }
    });
  }).catch(function(err){
    pyStatus("");
    throw (err && err.kind) ? err : { kind: "error", message: String(err && err.message || err) };
  });
}
function mainQueue(job){
  var p = PY.mainChain.then(function(){
    if(job.onStart) job.onStart();
    return mainCall(job.msg);
  });
  PY.mainChain = p.catch(function(){});
  p.then(job.resolve, job.reject);
}
function switchToMain(){
  if(PY.mode === "main") return;
  PY.mode = "main";
  dropWorker();
  var jobs = (PY.active ? [PY.active] : []).concat(PY.queue);
  if(PY.active){ clearTimeout(PY.active.timer); clearTimeout(PY.active.bootTimer); }
  PY.active = null; PY.queue = [];
  jobs.forEach(mainQueue);
}

function pyCall(msg, opts){
  opts = opts || {};
  msg.url = PYODIDE_URL; msg.harness = harnessSrc;
  return new Promise(function(resolve, reject){
    var job = { id: ++PY.seq, msg: msg, resolve: resolve, reject: reject,
                timeout: opts.timeout || 20000, onStart: opts.onStart };
    msg.id = job.id;
    if(PY.mode === "main"){ mainQueue(job); return; }
    PY.queue.push(job);
    pump();
  });
}

/* تسخين: أول ما الطالب يقرّب من زرار تشغيل، نبدأ نحمّل بايثون في الخلفية */
function pyWarm(){
  if(PY.warmed || PY.mode === "main" || PY.booted) return;
  PY.warmed = true;
  pyCall({ kind: "warm", code: "" }, { timeout: 5000 }).catch(function(){ PY.warmed = false; });
}
["pointerover", "focusin", "touchstart"].forEach(function(ev){
  document.addEventListener(ev, function(e){
    if(e.target.closest && e.target.closest(".run-btn, .edit-btn, .ch-run, .ch-try, .code-editor")) pyWarm();
  }, { passive: true });
});
window.addEventListener("online", function(){ PY.warmed = false; });

function friendlyError(err){
  err = err || {};
  if(err.kind === "timeout") return "⏱ الكود أخد وقت أطول من اللازم فوقّفناه — غالبًا فيه حلقة ما بتخلصش. راجع شرط الحلقة وجرّب تاني.";
  if(err.kind === "stopped") return "⏹ اتوقّف التشغيل.";
  if(err.kind === "bootTimeout") return "🐢 تحميل بايثون أخد وقت طويل جدًا — اتأكّد من الإنترنت واضغط ▶ تاني.";
  var msg = err.message || "";
  if(!navigator.onLine) return "📴 إنت مش متّصل بالإنترنت — تشغيل الأكواد جوّه الصفحة محتاج إنترنت أول مرّة. اتّصل واضغط ▶ تاني.";
  if(/importScripts|NetworkError|Failed to fetch|Failed to load|load/i.test(msg))
    return "🌐 مش قادرين نحمّل بايثون — تشغيل الأكواد جوّه الصفحة محتاج إنترنت أول مرّة. جرّب تاني بعد شوية. (" + msg + ")";
  return "⚠️ حصلت مشكلة في المشغّل: " + msg + " — جرّب تاني، ولو استمرّت حدّث الصفحة.";
}

/* هل البلوك ده ينفع يتشغّل في المتصفّح؟ */
var NOT_PY_FILES = /^(terminal|\.env|\.gitignore|requirements\.txt|pytest\.ini|pyproject\.toml|conftest\.py)$/i;
function runnability(box, raw){
  var file = box.dataset.file || "";
  if(box.hasAttribute("data-norun")) return { ok: false, hidden: true };
  if(NOT_PY_FILES.test(file) || (file && !/\.py$/i.test(file))) return { ok: false, hidden: true };
  if(/^<{7}|^={7}$|^>{7}/m.test(raw)) return { ok: false, hidden: true };
  if(/^\s*>>>\s/.test(raw)) return { ok: false, hidden: true };          /* جلسة تفاعلية منسوخة، مش سكريبت */
  if(/^\s*(pip|python|git|mypy|pytest|cd|mkdir|export|\$env|fastapi|flask)\b/m.test(raw) && !/^\s*(def|import|from|print)\b/m.test(raw))
    return { ok: false, hidden: true };
  var why = null;
  if(/(^|\/)(test_[^\/]*|[^\/]*_test)\.py$|^tests\//.test(file)) why = "ملف اختبارات — شغّله على جهازك بـ pytest";
  else if(/\bbreakpoint\s*\(|^\s*import\s+pdb\b|pdb\.set_trace/m.test(raw)) why = "المنقّح (pdb) محتاج Terminal حقيقي — شغّل الكود على جهازك";
  else if(/^\s*(import|from)\s+(asyncio|threading|multiprocessing|concurrent\.futures|concurrent|httpx|aiohttp)\b|\basyncio\.run\s*\(/m.test(raw)) why = "التزامن (asyncio والخيوط والعمليات) محتاج بايثون على جهازك — الصفحة بتشغّل الكود جوّه حلقة أحداث واحدة";
  else if(/^\s*(import|from)\s+(gtts|whisper|pytesseract|pdf2image|deep_translator|translate|googletrans|speech_recognition|pyttsx3|pyautogui|selenium|playwright|google\.colab|telebot|telegram|discord|openai|anthropic)\b/m.test(raw)) why = "المكتبة دي محتاجة جهازك (برامج أو إنترنت أو مفاتيح) — شغّل الكود هناك";
  else if(/^\s*(import|from)\s+(tkinter|pygame|machine)\b/m.test(raw)) why = "الكود ده بيفتح نافذة أو بيكلّم جهاز — شغّله على جهازك";
  else if(/^\s*(import|from)\s+(flask|fastapi|uvicorn)\b/m.test(raw)) why = "ده سيرفر ويب — شغّله على جهازك وافتحه من المتصفّح";
  else if(/^\s*import\s+(argparse)\b|sys\.argv/m.test(raw)) why = "الكود ده بياخد وسائط من الـ Terminal — شغّله على جهازك";
  else if(/^\s*(import|from)\s+(requests|dotenv|pytest)\b|pytest\./m.test(raw)) why = "الكود ده محتاج جهازك (إنترنت مباشر أو pytest) — شغّله هناك";
  else if(/\bsubprocess\b|\bos\.system\b/.test(raw)) why = "الكود ده بيشغّل أوامر نظام — شغّله على جهازك";
  return why ? { ok: false, why: why } : { ok: true };
}

/* ---------- محرّر نصوص بسيط للكود ---------- */
function makeEditor(value, label){
  var ta = el("textarea", "code-editor");
  ta.value = value;
  ta.spellcheck = false;
  ta.setAttribute("dir", "ltr");
  ta.setAttribute("aria-label", label || "محرّر الكود");
  ta.setAttribute("autocapitalize", "off");
  ta.setAttribute("autocomplete", "off");
  function fit(){ ta.style.height = "auto"; ta.style.height = Math.min(700, ta.scrollHeight + 4) + "px"; }
  ta.addEventListener("input", fit);
  ta.addEventListener("keydown", function(e){
    var s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
    if(e.key === "Tab" && !e.ctrlKey && !e.altKey){
      e.preventDefault();
      var lineStart = v.lastIndexOf("\n", s - 1) + 1;
      if(e.shiftKey){
        if(v.substr(lineStart, 4) === "    "){
          ta.value = v.slice(0, lineStart) + v.slice(lineStart + 4);
          ta.selectionStart = ta.selectionEnd = Math.max(lineStart, s - 4);
        }
      } else {
        ta.value = v.slice(0, s) + "    " + v.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
      fit();
    } else if(e.key === "Enter" && !e.ctrlKey && !e.shiftKey && !e.metaKey){
      var ls = v.lastIndexOf("\n", s - 1) + 1;
      var line = v.slice(ls, s);
      var indent = (line.match(/^\s*/) || [""])[0];
      if(/:\s*$/.test(line)) indent += "    ";
      e.preventDefault();
      ta.value = v.slice(0, s) + "\n" + indent + v.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 1 + indent.length;
      fit();
    }
  });
  setTimeout(fit, 0);
  ta._fit = fit;
  return ta;
}

/* الملفات اللي الكود محتاجها: ملفات بيانات الدرس + أي موديول محلّي بيستورده */
function importedModules(code){
  var names = [], m;
  var re = /^[ \t]*(?:from[ \t]+([\w.]+)[ \t]+import|import[ \t]+([\w., \t]+))/gm;
  while((m = re.exec(code))){
    if(m[1]) names.push(m[1]);
    else m[2].split(",").forEach(function(p){ var n = p.trim().split(/\s+/)[0]; if(n) names.push(n); });
  }
  return names;
}
function blockCode(box){
  var ed = $(".code-editor", box);
  if(ed) return ed.value;
  var pre = $("pre", box);
  return pre ? (pre.dataset.raw !== undefined ? pre.dataset.raw : pre.textContent.replace(/^\n/, "").replace(/\s+$/, "")) : "";
}
function lessonFiles(lessonId, code, current){
  var art = document.getElementById(lessonId);
  if(!art) return "[]";
  var files = [];
  $$("script.py-fixture", art).forEach(function(sc){
    files.push({ name: sc.dataset.name, content: sc.textContent, seed: true });
  });
  /* لكل اسم ملف: آخر نسخة ظهرت قبل المثال الحالي (زي ما الطالب كتبها بالترتيب)،
     ولو مفيش قبله ناخد أول نسخة بعده — في نفس الدرس الأول، وبعدين في الوحدة */
  var scope = art.closest(".unit") || art;
  var byName = {}, passed = false;
  $$('.code[data-file$=".py"], .code:not([data-file])', scope).forEach(function(box){
    if(box === current){ passed = true; return; }
    var fn = box.dataset.file;
    if(!fn) return;
    var inLesson = box.closest(".lesson") === art;
    var prev = byName[fn];
    var rank = inLesson ? (passed ? 1 : 2) : 0;          /* 2: قبله في الدرس · 1: بعده في الدرس · 0: الوحدة */
    if(!prev || rank > prev.rank || (rank === prev.rank && rank === 2) || (rank === 0 && prev.rank === 0 && !passed))
      byName[fn] = { box: box, rank: rank };
  });
  Object.keys(byName).forEach(function(k){ byName[k] = byName[k].box; });
  var seen = {};
  (function walk(src, depth){
    if(depth > 4) return;
    importedModules(src).forEach(function(mod){
      var parts = mod.split(".");
      for(var i = 1; i <= parts.length; i++){
        var base = parts.slice(0, i).join("/");
        [base + ".py", base + "/__init__.py"].forEach(function(cand){
          if(seen[cand] || !byName[cand]) return;
          seen[cand] = true;
          var content = blockCode(byName[cand]);
          files.push({ name: cand, content: content });
          walk(content, depth + 1);
        });
      }
    });
  })(code, 0);
  return JSON.stringify(files);
}

/* اسم الملف اللي هيظهر في رسايل الخطأ: اسم ملف المثال لو له اسم */
function scriptName(box){
  var f = box.dataset.file || "";
  return /^[\w.-]+\.py$/.test(f) ? f : "main.py";
}

function outputHTML(data){
  var html = "";
  var out = data.out !== undefined ? String(data.out) : "";
  var MAX_OUT = 60000;
  var cut = out.length > MAX_OUT;
  if(cut) out = out.slice(0, MAX_OUT - 3000) + "\n\n… (اتشال جزء من النص) …\n\n" + out.slice(-3000);
  if(!out.trim() && !(data.images || []).length) out = "(البرنامج اشتغل وما طبعش حاجة)";
  html += '<pre class="' + (data.failed ? "has-err" : "") + '">' + escHTML(out) + '</pre>';
  if(cut) html += '<p class="run-hint">✂️ الناتج طويل جدًا فعرضنا أوله وآخره بس.</p>';
  (data.images || []).forEach(function(img){
    html += '<figure class="run-img"><img alt="صورة ولّدها الكود: ' + escHTML(img[0]) + '" src="data:image/png;base64,' + img[1] + '"><figcaption>' + escHTML(img[0]) + '</figcaption></figure>';
  });
  if(data.failed && /EOFError/.test(out))
    html += '<p class="run-hint">💡 البرنامج طلب إدخال (<code class="inl">input</code>) ومفيش مدخلات. اكتبها في خانة «المدخلات» — كل سطر لـ input واحد — وشغّل تاني.</p>';
  else if(data.failed && /NameError/.test(out))
    html += '<p class="run-hint">💡 لو المتغيّر أو الدالة متعرّفين في مثال قبل ده في نفس الدرس، شغّل المثال ده الأول.</p>';
  if(data.pipError)
    html += '<p class="run-hint">📦 المكتبة دي مش متاحة جوّه المتصفّح — جرّب الكود على جهازك بعد <code class="inl">pip install</code>.</p>';
  return html;
}

function attachRunner(box, pre, lessonId, blockKey){
  var raw = pre.dataset.raw;
  var can = runnability(box, raw);
  var head = $(".code-head", box);
  if(!can.ok){
    if(can.why){
      var note = el("span", "run-na", "💻 على جهازك");
      note.title = can.why;
      note.setAttribute("aria-label", can.why);
      head.insertBefore(note, head.querySelector(".copy-btn"));
    }
    return;
  }
  var needsInput = /\binput\s*\(/.test(raw);
  var prompts = needsInput ? inputPrompts(raw) : [];
  var runBtn = el("button", "run-btn", "▶ شغّل");
  runBtn.type = "button";
  runBtn.title = "شغّل الكود جوّه الصفحة (Ctrl+Enter وإنت بتعدّل)";
  var editBtn = el("button", "edit-btn", "✏️ عدّل");
  editBtn.type = "button";
  head.insertBefore(editBtn, head.querySelector(".copy-btn"));
  head.insertBefore(runBtn, editBtn);

  var editor = null;
  var panel = null, outBox = null, stdinBox = null, statusLine = null, stopBtn = null;

  function currentCode(){ return editor ? editor.value : raw; }

  function ensurePanel(){
    if(panel) return;
    panel = el("div", "run-panel");
    panel.innerHTML =
      '<div class="run-head"><span class="rt">🧪 ناتج التشغيل جوّه المتصفّح</span>' +
      '<button type="button" class="run-stop" hidden>⏹ إيقاف</button>' +
      '<button type="button" class="run-reset" title="امسح المتغيّرات والملفات اللي اتعملت في أمثلة الدرس ده">↺ ذاكرة جديدة</button>' +
      '<button type="button" class="run-close" aria-label="إغلاق الناتج">✕</button></div>' +
      (needsInput ? '<label class="stdin-lbl">📥 المدخلات (كل سطر = <code class="inl">input</code> واحد)' +
        (prompts.length ? '<span class="stdin-hint">الكود هيسأل بالترتيب: ' + prompts.map(function(t, i){ return (i + 1) + ") " + escHTML(t || "مدخل"); }).join(" · ") + '</span>' : '') +
        '<textarea class="stdin" dir="auto" rows="' + Math.min(4, Math.max(2, prompts.length)) + '" placeholder="' + (prompts.length ? "سطر لكل سؤال" : "مثال:&#10;سارة&#10;25") + '"></textarea></label>' : '') +
      '<p class="run-status" role="status" aria-live="polite"></p>' +
      '<div class="run-out"></div>';
    var anchor = box;
    while(anchor.nextElementSibling && anchor.nextElementSibling.classList.contains("out")) anchor = anchor.nextElementSibling;
    anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    outBox = $(".run-out", panel);
    stdinBox = $(".stdin", panel);
    statusLine = $(".run-status", panel);
    stopBtn = $(".run-stop", panel);
    stopBtn.addEventListener("click", function(){ pyKill("stopped"); });
    $(".run-close", panel).addEventListener("click", function(){ panel.hidden = true; });
    $(".run-reset", panel).addEventListener("click", function(){
      pyCall({ kind: "reset", ns: lessonId, code: "" }).then(function(){
        statusLine.textContent = "✓ ذاكرة الدرس اتمسحت — المتغيّرات والملفات اللي اتعملت في الدرس ده رجعت من الأول.";
      }, function(err){ statusLine.textContent = friendlyError(err); });
    });
    if(stdinBox){
      var saved = (state.edits[blockKey] || {}).stdin;
      if(saved) stdinBox.value = saved;
      stdinBox.addEventListener("input", function(){
        state.edits[blockKey] = state.edits[blockKey] || {};
        state.edits[blockKey].stdin = stdinBox.value;
        saveSoon("edits");
      });
    }
  }

  function run(){
    ensurePanel();
    panel.hidden = false;
    if(needsInput && !stdinBox.value.trim()){
      statusLine.textContent = "📥 الكود ده بيطلب مدخلات بـ input — اكتبها في الخانة (كل سطر لمدخل) ثم اضغط ▶ تاني.";
      stdinBox.focus();
      if(!panel._askedOnce){ panel._askedOnce = true; return; }
    }
    runBtn.disabled = true;
    runBtn.textContent = "⏳ بيشتغل…";
    outBox.innerHTML = "";
    statusLine.textContent = "⏳ بنجهّز التشغيل…";
    var unsub = onStatus(function(t){ if(t) statusLine.textContent = t; });
    var code = currentCode();
    pyCall({ kind: "run", code: code, stdin: stdinBox ? stdinBox.value : "", ns: lessonId, files: lessonFiles(lessonId, code, box), filename: scriptName(box) }, {
      onStart: function(){ stopBtn.hidden = false; statusLine.textContent = "▶ شغّال…"; }
    }).then(function(data){
      outBox.innerHTML = outputHTML(data);
      statusLine.textContent = data.failed ? "✗ الكود وقع — اقرا رسالة الخطأ من تحت لفوق." : "✓ اتشغّل بنجاح.";
    }, function(err){
      outBox.innerHTML = "";
      statusLine.textContent = friendlyError(err);
    }).then(function(){
      unsub();
      stopBtn.hidden = true;
      runBtn.disabled = false;
      runBtn.textContent = "▶ شغّل";
    });
  }

  function openEditor(){
    if(editor){ return; }
    var saved = (state.edits[blockKey] || {}).code;
    editor = makeEditor(saved !== undefined ? saved : raw, "تعديل الكود");
    pre.hidden = true;
    box.appendChild(editor);
    var bar = el("div", "edit-bar",
      '<span>✏️ بتعدّل نسخة ليك — الأصل محفوظ. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> للتشغيل</span>' +
      '<button type="button" class="edit-restore">↺ رجّع الأصل</button>' +
      '<button type="button" class="edit-done">✓ خلّصت التعديل</button>');
    box.appendChild(bar);
    editBtn.textContent = "📄 الأصل";
    editor.addEventListener("keydown", function(e){
      if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); run(); }
    });
    editor.addEventListener("input", function(){
      state.edits[blockKey] = state.edits[blockKey] || {};
      state.edits[blockKey].code = editor.value;
      saveSoon("edits");
    });
    $(".edit-restore", bar).addEventListener("click", function(){
      editor.value = raw;
      editor._fit();
      if(state.edits[blockKey]){ delete state.edits[blockKey].code; save("edits"); }
    });
    $(".edit-done", bar).addEventListener("click", closeEditor);
    editor.focus();
  }
  function closeEditor(){
    if(!editor) return;
    var changed = editor.value !== raw;
    box.removeChild(editor);
    box.removeChild($(".edit-bar", box));
    editor = null;
    pre.hidden = false;
    editBtn.textContent = changed ? "✏️ عدّل (فيه تعديل محفوظ)" : "✏️ عدّل";
  }
  runBtn.addEventListener("click", run);
  editBtn.addEventListener("click", function(){ editor ? closeEditor() : openEditor(); });

  /* المثال ده بيكمّل على اللي قبله: زرار بيشغّل اللي قبله بالترتيب ثم ده */
  var dep = box.previousElementSibling && box.previousElementSibling.classList.contains("dep-note");
  if(dep){
    var chainBtn = el("button", "chain-btn", "⏩ شغّل من أول الدرس");
    chainBtn.type = "button";
    chainBtn.title = "بيشغّل الأمثلة اللي قبله في نفس الدرس بالترتيب، وبعدين المثال ده";
    head.insertBefore(chainBtn, editBtn);
    chainBtn.addEventListener("click", function(){
      var lesson = box.closest(".lesson");
      var boxes = $$(".code", lesson);
      var mine = boxes.indexOf(box);
      var before = boxes.slice(0, mine).filter(function(b){
        var p = $("pre", b);
        return b.querySelector(".run-btn") && p && !/\binput\s*\(/.test(p.dataset.raw || "");
      });
      ensurePanel();
      panel.hidden = false;
      chainBtn.disabled = true;
      statusLine.textContent = "⏳ بنشغّل " + before.length + " مثال قبله…";
      var i = 0;
      (function step(){
        if(i >= before.length){
          chainBtn.disabled = false;
          run();
          return;
        }
        var b = before[i++];
        var code = ($(".code-editor", b) || {}).value || $("pre", b).dataset.raw;
        pyCall({ kind: "run", code: code, stdin: "", ns: lessonId, files: lessonFiles(lessonId, code, b), filename: scriptName(b) })
          .then(step, function(){ step(); });
      })();
    });
  }
  if(state.edits[blockKey] && state.edits[blockKey].code !== undefined) editBtn.textContent = "✏️ عدّل (فيه تعديل محفوظ)";
}

function copyText(text){
  function legacy(){
    return new Promise(function(res, rej){
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try{ ok = document.execCommand("copy"); }catch(e){}
      ta.remove();
      ok ? res() : rej(new Error("copy failed"));
    });
  }
  if(navigator.clipboard && window.isSecureContext)
    return navigator.clipboard.writeText(text).catch(legacy);
  return legacy();
}

function onStatus(fn){
  PY.listeners.push(fn);
  return function(){ PY.listeners = PY.listeners.filter(function(x){ return x !== fn; }); };
}

/* ================================================================
   4) تجهيز كل وحدة لما تترسم
   ================================================================ */
function buildLinesTable(lines, notes){
  var rows = "", keys = 0;
  for(var i = 0; i < lines.length; i++){
    var src = lines[i];
    var isBlank = src.trim() === "";
    var note = isBlank ? "سطر فاضي — للفصل البصري فقط"
                       : (notes[i] && String(notes[i]).trim() ? notes[i] : "—");
    var isKey = !isBlank && /<b>/.test(note);
    if(isKey) keys++;
    rows += '<tr class="' + (isBlank ? "blank" : "") + (isKey ? " key" : "") + '">' +
      '<td class="ln">' + (isKey ? '<span class="star" aria-label="سطر مفتاحي">★</span>' : '') + (i + 1) + '</td>' +
      '<td class="src">' + (isBlank ? "" : window.hlPython(src)) + '</td>' +
      '<td class="exp">' + note + '</td></tr>';
  }
  var wrap = el("div", "tbl-wrap");
  var tools = "";
  if(keys) tools = '<div class="lines-tools"><button type="button" class="key-only" aria-pressed="false">★ الأسطر المفتاحية بس (' + keys + ')</button></div>';
  wrap.innerHTML = tools + '<table class="lines-tbl"><tr><th>#</th><th>السطر</th><th>الشرح</th></tr>' + rows + '</table>';
  var kb = $(".key-only", wrap);
  if(kb) kb.addEventListener("click", function(){
    var on = wrap.classList.toggle("keys-only");
    kb.setAttribute("aria-pressed", on ? "true" : "false");
    kb.textContent = on ? "☰ اعرض كل الأسطر" : "★ الأسطر المفتاحية بس (" + keys + ")";
  });
  return wrap;
}

function buildLinesFooter(d){
  var foot = el("div", "lines-foot");
  var btn = el("button", "lines-close", "✕ إغلاق الشرح");
  btn.type = "button";
  btn.addEventListener("click", function(){
    d.open = false;
    if(d.getBoundingClientRect().top < 0) d.scrollIntoView({ block: "center" });
  });
  foot.appendChild(btn);
  return foot;
}

function enhanceCode(root){
  eachSafe($$(".lesson", root), function(ls){
    $$(".code", ls).forEach(function(box, idx){
      var pre = $("pre", box);
      if(!pre || pre.dataset.raw !== undefined) return;
      var raw = pre.textContent.replace(/^\n/, "").replace(/\s+$/, "");
      pre.dataset.raw = raw;
      pre.innerHTML = window.hlPython(raw);
      var head = el("div", "code-head", '<span class="fname">' + escHTML(box.dataset.file || "python") + '</span>');
      var copy = el("button", "copy-btn", "نسخ");
      copy.type = "button";
      copy.addEventListener("click", function(){
        var ed = $(".code-editor", box);
        var text = ed ? ed.value : raw;
        var done = function(){
          copy.textContent = "تم ✓"; copy.classList.add("done");
          setTimeout(function(){ copy.textContent = "نسخ"; copy.classList.remove("done"); }, 1600);
        };
        copyText(text).then(done, function(){
          copy.textContent = "انسخ يدويًا (Ctrl+C)";
          setTimeout(function(){ copy.textContent = "نسخ"; }, 2500);
          var r = document.createRange(); r.selectNodeContents(ed || pre);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        });
      });
      head.appendChild(copy);
      box.insertBefore(head, pre);

      var key = ls.id + "." + (idx + 1);
      var notes = LINE_NOTES[key];
      if(notes){
        var lines = raw.split("\n");
        var d = el("details", "lines",
          '<summary><span class="lbl-open">🔍 اشرح الكود سطرًا بسطر</span>' +
          '<span class="lbl-close">✕ إغلاق الشرح</span>' +
          '<span class="cnt">' + lines.length + ' سطر</span></summary>');
        var built = false;
        d.addEventListener("toggle", function(){
          if(d.open && !built){
            built = true;
            d.appendChild(buildLinesTable(lines, notes));
            d.appendChild(buildLinesFooter(d));
          }
        });
        var anchor = box;
        while(anchor.nextElementSibling && anchor.nextElementSibling.classList.contains("out")) anchor = anchor.nextElementSibling;
        anchor.parentNode.insertBefore(d, anchor.nextSibling);
      }
      if(!box.closest(".challenge")) attachRunner(box, pre, ls.id, key);
    });
  });
}

function enhanceMiniToc(root){
  eachSafe($$(".lesson", root), function(ls){
    var heads = $$(":scope > h4", ls);
    if(heads.length < 2) return;
    var ol = "";
    heads.forEach(function(h, i){
      if(!h.id) h.id = ls.id + "-p" + (i + 1);
      ol += '<li><a href="#' + h.id + '">' + escHTML(h.textContent) + '</a></li>';
    });
    var box = el("div", "mini-toc", '<div class="mt-title">📌 محتويات هذا الدرس</div><ol>' + ol + '</ol>');
    var anchor = $(".goal", ls) || $("h3", ls);
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
  });
}

/* ---------- الاختبارات القصيرة (مع حفظ الإجابات) ---------- */
function optionHTML(label){
  var clone = label.cloneNode(true);
  $$("input, .mark, .sr-only", clone).forEach(function(x){ x.remove(); });
  return clone.innerHTML.trim();
}
function markLabel(label, symbol, srText){
  var m = el("span", "mark");
  m.setAttribute("aria-hidden", "true");
  m.textContent = symbol;
  label.appendChild(m);
  var sr = el("span", "sr-only");
  sr.textContent = " — " + srText;
  label.appendChild(sr);
}

function enhanceQuizzes(root){
  eachSafe($$(".lesson", root), function(ls){
    $$(".quiz", ls).forEach(function(quiz, qn){
      var qkey = ls.id + ":" + qn;
      var qs = $$(".q", quiz);
      var saved = state.quiz[qkey] || { a: {} };
      qs.forEach(function(q, i){
        var qt = $(".qt", q);
        if(qt){
          qt.id = "qt-" + qkey.replace(/[^\w-]/g, "_") + "-" + i;
          q.setAttribute("role", "group");
          q.setAttribute("aria-labelledby", qt.id);
        }
        $$('input[type="radio"]', q).forEach(function(inp, j){
          inp.name = "quiz-" + qkey + "-" + i;
          inp.value = j;
          inp.id = "opt-" + qkey.replace(/[^\w-]/g, "_") + "-" + i + "-" + j;
          var lbl = inp.closest("label");
          if(lbl) lbl.setAttribute("for", inp.id);
          if(saved.a[i] === j) inp.checked = true;
          inp.addEventListener("change", function(){
            var s = state.quiz[qkey] || { a: {} };
            s.a[i] = j;
            state.quiz[qkey] = s;
            save("quiz");
          });
        });
      });
      var bar = el("div", "quiz-bar");
      var btn = el("button", "quiz-check", "صحّح إجاباتي");
      btn.type = "button";
      var again = el("button", "quiz-again", "↺ أعد الاختبار");
      again.type = "button";
      again.hidden = true;
      bar.appendChild(btn); bar.appendChild(again);
      var res = el("div", "quiz-result");
      res.setAttribute("role", "status");
      res.setAttribute("aria-live", "polite");
      quiz.appendChild(bar); quiz.appendChild(res);

      function clearMarks(){
        qs.forEach(function(q){
          $$("label", q).forEach(function(l){
            l.classList.remove("ok", "bad");
            $$(".mark, .sr-only", l).forEach(function(x){ x.remove(); });
          });
          var old = $(".q-feedback", q);
          if(old) old.remove();
        });
      }

      function grade(silent){
        clearMarks();
        var answered = qs.filter(function(q){ return $("input:checked", q); }).length;
        if(answered === 0){
          res.textContent = "جاوب على الأسئلة الأول 🙂";
          res.style.color = "var(--tx2)";
          return;
        }
        var score = 0, wrong = 0, blank = 0, wrongIdx = [];
        qs.forEach(function(q, qi){
          var correct = parseInt(q.dataset.a, 10);
          var labels = $$("label", q);
          var correctLabel = labels[correct];
          var correctHTML = correctLabel ? optionHTML(correctLabel) : "—";
          var picked = $("input:checked", q);
          if(correctLabel){ correctLabel.classList.add("ok"); markLabel(correctLabel, "✓", "الإجابة الصحيحة"); }
          var fb = el("p", "q-feedback");
          if(!picked){
            blank++;
            fb.classList.add("fb-none");
            fb.innerHTML = '<span class="fb-icon" aria-hidden="true">—</span><strong>لم تُجب على هذا السؤال.</strong> الإجابة الصحيحة: <span class="ans">' + correctHTML + '</span>';
          } else if(parseInt(picked.value, 10) === correct){
            score++;
            fb.classList.add("fb-ok");
            fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✓</span><strong>إجابة صحيحة.</strong> الإجابة هي: <span class="ans">' + correctHTML + '</span>';
          } else {
            wrong++;
            wrongIdx.push(qi);
            fb.classList.add("fb-bad");
            var wl = labels[parseInt(picked.value, 10)];
            var wrongHTML = "—";
            if(wl){ wrongHTML = optionHTML(wl); wl.classList.add("bad"); markLabel(wl, "✗", "إجابتك، وهي خطأ"); }
            fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✗</span><strong>إجابة خاطئة.</strong> إجابتك: <span class="ans">' + wrongHTML + '</span> — الإجابة الصحيحة: <span class="ans">' + correctHTML + '</span>';
          }
          q.appendChild(fb);
        });
        var total = qs.length;
        var parts = ["نتيجتك: " + score + " من " + total];
        if(wrong) parts.push(wrong + " إجابة خاطئة");
        if(blank) parts.push(blank + " سؤال بدون إجابة");
        parts.push(score === total ? "🎉 ممتاز، كل الإجابات صحيحة" : "الإجابة الصحيحة مكتوبة تحت كل سؤال ومعلّمة بعلامة ✓");
        res.textContent = parts.join(" — ");
        res.style.color = score === total ? "var(--ok)" : "var(--warn)";
        again.hidden = false;
        var s = state.quiz[qkey] || { a: {} };
        s.graded = true; s.score = score; s.total = total; s.t = Date.now();
        s.wrong = wrongIdx;
        state.quiz[qkey] = s;
        save("quiz");
      }
      btn.addEventListener("click", function(){ grade(false); });
      again.addEventListener("click", function(){
        clearMarks();
        $$("input:checked", quiz).forEach(function(i){ i.checked = false; });
        res.textContent = "";
        again.hidden = true;
        delete state.quiz[qkey];
        save("quiz");
        var first = $("input", quiz);
        if(first) first.focus();
      });
      if(saved.graded) grade(true);
    });
  });
}

/* ---------- «حاولت الأول؟» قبل الحلول ---------- */
function enhanceSolutions(root){
  $$(".ex details.sol", root).forEach(function(d){
    if(d.closest(".challenge")) return;
    var sum = $("summary", d);
    var hint = null;
    sum.addEventListener("click", function(e){
      if(d.open || d.dataset.tried) return;
      e.preventDefault();
      d.dataset.tried = "1";
      hint = el("p", "sol-hint", "🤔 حاولت تحلّه بنفسك الأول؟ المحاولة (حتى لو غلط) هي اللي بتعلّم. اضغط «شوف الحل» تاني لو عايز تكمّل.");
      hint.setAttribute("role", "status");
      d.parentNode.insertBefore(hint, d);
    });
    d.addEventListener("toggle", function(){ if(d.open && hint){ hint.remove(); hint = null; } });
  });
}

/* ---------- التحدّيات المُصحَّحة آليًا ---------- */
function enhanceChallenges(root){
  eachSafe($$(".challenge", root), function(ch){
    var id = ch.dataset.ch;
    var starterEl = $(".ch-starter", ch);
    var testsEl = $(".ch-tests", ch);
    if(!starterEl || !testsEl) return;
    var starter = starterEl.value.replace(/^\n/, "");
    var tests = testsEl.textContent;
    var st = state.ch[id] || {};
    var head = $(".ch-head", ch);
    var badge = el("span", "ch-badge");
    if(head) head.appendChild(badge);
    function paintBadge(){
      st = state.ch[id] || {};
      badge.textContent = st.solved ? "✓ اتحل" : (st.tries ? "محاولات: " + st.tries : "");
      badge.className = "ch-badge" + (st.solved ? " solved" : "");
      ch.classList.toggle("solved", !!st.solved);
    }
    paintBadge();

    var editor = makeEditor(st.code !== undefined ? st.code : starter, "كود الحل الخاص بيك");
    var tools = el("div", "ch-tools",
      '<button type="button" class="ch-run">✅ اختبر حلّي</button>' +
      '<button type="button" class="ch-try">▶ شغّل بس</button>' +
      '<button type="button" class="ch-reset">↺ ابدأ من جديد</button>' +
      '<span class="ch-kbd"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> للاختبار</span>');
    var status = el("p", "ch-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    var results = el("div", "ch-results");
    starterEl.parentNode.insertBefore(editor, starterEl);
    editor._fit();               /* الحجم النهائي فورًا: التوسّع المتأخّر كان بيزحلق اللي تحته */
    editor.parentNode.insertBefore(tools, editor.nextSibling);
    tools.parentNode.insertBefore(status, tools.nextSibling);
    /* برامج بتقرا input: خانة مدخلات لزرار «شغّل بس» (الاختبارات بتبعت مدخلاتها بنفسها) */
    var chStdin = null;
    if(/PROGRAM_MODE|\binput\s*\(/.test(tests + "\n" + starter)){
      var sl = el("label", "stdin-lbl ch-stdin",
        '📥 مدخلات للتجربة مع «▶ شغّل بس» (كل سطر = <code class="inl">input</code> واحد)' +
        '<textarea class="stdin" dir="auto" rows="2"></textarea>');
      tools.parentNode.insertBefore(sl, tools);
      chStdin = $("textarea", sl);
      if(st.stdin) chStdin.value = st.stdin;
      chStdin.addEventListener("input", function(){
        var s = state.ch[id] || {};
        s.stdin = chStdin.value;
        state.ch[id] = s;
        saveSoon("ch");
      });
    }
    status.parentNode.insertBefore(results, status.nextSibling);

    var sol = $("details.sol", ch);
    if(sol){
      var sum = $("summary", sol);
      sum.addEventListener("click", function(e){
        var s = state.ch[id] || {};
        if(!sol.open && !s.tries){
          e.preventDefault();
          status.textContent = "🔒 الحل هيتفتح بعد أول محاولة — اكتب حلّك واضغط «اختبر حلّي» مرّة على الأقل.";
        }
      });
    }

    function persist(extra, later){
      var s = state.ch[id] || {};
      s.code = editor.value;
      if(extra) Object.keys(extra).forEach(function(k){ s[k] = extra[k]; });
      state.ch[id] = s;
      if(later) saveSoon("ch"); else save("ch");
    }
    editor.addEventListener("input", function(){ persist(null, true); });
    editor.addEventListener("keydown", function(e){
      if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); check(); }
    });

    var busy = false;
    function lock(on, label){
      busy = on;
      $$("button", tools).forEach(function(b){ b.disabled = on; });
      if(label) status.textContent = label;
    }

    function check(){
      if(busy) return;
      lock(true, "⏳ بنشغّل الاختبارات…");
      results.innerHTML = "";
      var unsub = onStatus(function(t){ if(t) status.textContent = t; });
      pyCall({ kind: "test", code: editor.value, tests: tests }, { timeout: 15000 }).then(function(r){
        var s = state.ch[id] || {};
        var tries = (s.tries || 0) + 1;
        if(r.crash){
          results.innerHTML = '<p class="ch-crash">💥 الكود وقع قبل ما الاختبارات تبدأ:</p><pre class="has-err">' + escHTML(r.crash) + '</pre>';
          status.textContent = "✗ صلّح الخطأ ده الأول (اقرا آخر سطر فيه).";
          persist({ tries: tries });
          paintBadge();
          return;
        }
        var ok = r.tests.filter(function(t){ return t[1]; }).length;
        var html = '<ul class="ch-list">';
        r.tests.forEach(function(t){
          html += '<li class="' + (t[1] ? "pass" : "fail") + '"><span class="ic" aria-hidden="true">' + (t[1] ? "✓" : "✗") + '</span>' +
            '<span class="sr-only">' + (t[1] ? "نجح: " : "فشل: ") + '</span>' + escHTML(t[0]) +
            (t[1] ? "" : '<div class="why">' + escHTML(t[2]) + '</div>') + '</li>';
        });
        html += '</ul>';
        if(r.output && r.output.trim()) html += '<details class="ch-out"><summary>اللي كودك طبعه</summary><pre>' + escHTML(r.output) + '</pre></details>';
        results.innerHTML = html;
        var all = ok === r.tests.length && r.tests.length > 0;
        status.textContent = all
          ? "🎉 كل الاختبارات نجحت (" + ok + "/" + r.tests.length + ") — حل ممتاز! قارن حلّك بالحل النموذجي."
          : "نجح " + ok + " من " + r.tests.length + " — اقرا سبب الفشل تحت كل اختبار وعدّل.";
        persist({ tries: tries, solved: s.solved || all, lastScore: ok + "/" + r.tests.length });
        paintBadge();
        refreshTocState();
      }, function(err){
        status.textContent = friendlyError(err);
      }).then(function(){ unsub(); lock(false); });
    }

    function tryRun(){
      if(busy) return;
      lock(true, "⏳ بنشغّل كودك…");
      var unsub = onStatus(function(t){ if(t) status.textContent = t; });
      pyCall({ kind: "run", code: editor.value, stdin: chStdin ? chStdin.value : "", ns: "challenge:" + id }, { timeout: 15000 }).then(function(data){
        results.innerHTML = '<div class="run-out">' + outputHTML(data) + '</div>';
        status.textContent = data.failed ? "✗ الكود وقع." : "✓ اتشغّل — ده الناتج (مش تصحيح). اضغط «اختبر حلّي» للتقييم.";
        pyCall({ kind: "reset", ns: "challenge:" + id, code: "" }).catch(function(){});
      }, function(err){ status.textContent = friendlyError(err); })
      .then(function(){ unsub(); lock(false); });
    }

    $(".ch-run", tools).addEventListener("click", check);
    $(".ch-try", tools).addEventListener("click", tryRun);
    $(".ch-reset", tools).addEventListener("click", function(){
      editor.value = starter;
      editor._fit();
      persist();
      results.innerHTML = "";
      status.textContent = "↺ رجعنا لكود البداية.";
    });
  });
}

/* ---------- نقاط التفتيش ---------- */
function enhanceCheckpoints(root){
  eachSafe($$(".checkpoint", root), function(cp){
    var key = cp.dataset.unit;
    var items = $$("li", cp);
    var saved = state.cp[key] || [];
    var prog = el("p", "cp-prog");
    prog.setAttribute("role", "status");
    items.forEach(function(li, i){
      var id = "cp-" + key + "-" + i;
      var html = li.innerHTML;
      li.innerHTML = '<label for="' + id + '"><input type="checkbox" id="' + id + '"> <span>' + html + '</span></label>';
      var box = $("input", li);
      box.checked = saved.indexOf(i) > -1;
      box.addEventListener("change", function(){
        var list = state.cp[key] || [];
        list = list.filter(function(x){ return x !== i; });
        if(box.checked) list.push(i);
        state.cp[key] = list;
        save("cp");
        paint();
      });
    });
    function paint(){
      var n = (state.cp[key] || []).length;
      prog.textContent = n === items.length
        ? "🎉 " + n + "/" + items.length + " — إنت جاهز للوحدة الجاية!"
        : n + "/" + items.length + " — اللي مش متأكّد منه، ارجع لدرسه قبل ما تكمّل.";
      cp.classList.toggle("complete", n === items.length);
    }
    cp.appendChild(prog);
    paint();
  });
}

/* ---------- ذيل الدرس: تم + وقت + رأيك ---------- */
function enhanceLessonFoot(root){
  eachSafe($$(".lesson", root), function(ls){
    var info = lessonIndex[ls.id];
    var h3 = $("h3", ls);
    if(info && h3 && !$(".mins", h3)){
      var m = el("span", "mins", "⏱ " + info.minutes + " د");
      m.title = "الوقت التقريبي للدرس ده بالتمارين";
      h3.appendChild(m);
    }
    var foot = el("div", "lesson-foot");
    var b = el("button", "done-btn");
    b.type = "button";
    function paint(){
      var on = !!state.done[ls.id];
      b.classList.toggle("on", on);
      b.textContent = on ? "✓ خلّصت الدرس ده" : "علّم كمكتمل";
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
    b.addEventListener("click", function(){
      if(state.done[ls.id]) delete state.done[ls.id]; else state.done[ls.id] = Date.now();
      save("done"); paint(); refreshTocState();
    });
    paint();
    foot.appendChild(b);

    var fb = el("div", "fb");
    var f = state.fb[ls.id] || {};
    fb.innerHTML =
      '<span class="fb-q">الدرس كان واضح؟</span>' +
      '<button type="button" class="fb-btn" data-v="1" aria-pressed="false">👍 آه</button>' +
      '<button type="button" class="fb-btn" data-v="-1" aria-pressed="false">👎 مش أوي</button>' +
      '<div class="fb-more" hidden><label>إيه اللي محتاج توضيح أكتر؟ <textarea rows="2" dir="auto"></textarea></label>' +
      '<button type="button" class="fb-save">حفظ الملاحظة</button><span class="fb-ok" role="status"></span></div>';
    var more = $(".fb-more", fb), ta = $("textarea", fb), okMsg = $(".fb-ok", fb);
    if(f.note) ta.value = f.note;
    function paintFb(){
      var cur = (state.fb[ls.id] || {}).v;
      $$(".fb-btn", fb).forEach(function(x){
        var on = String(cur) === x.dataset.v;
        x.classList.toggle("on", on);
        x.setAttribute("aria-pressed", on ? "true" : "false");
      });
      more.hidden = cur !== -1;
    }
    $$(".fb-btn", fb).forEach(function(x){
      x.addEventListener("click", function(){
        var s = state.fb[ls.id] || {};
        s.v = parseInt(x.dataset.v, 10); s.t = Date.now();
        state.fb[ls.id] = s; save("fb"); paintFb();
        if(s.v === -1) ta.focus();
      });
    });
    $(".fb-save", fb).addEventListener("click", function(){
      var s = state.fb[ls.id] || {};
      s.note = ta.value.trim(); s.t = Date.now();
      state.fb[ls.id] = s; save("fb");
      okMsg.textContent = "✓ اتحفظت — شكرًا!";
    });
    paintFb();
    foot.appendChild(fb);
    ls.appendChild(foot);
    spyIO.observe(ls);
  });
}

function enhance(root, u){
  enhanceMiniToc(root);
  enhanceDiagrams(root);
  enhanceCode(root);
  enhanceQuizzes(root);
  enhanceSolutions(root);
  enhanceChallenges(root);
  enhanceCheckpoints(root);
  enhanceLessonFoot(root);
  enhanceNav(root);
}

/* ================================================================
   5) الفهرس الجانبي + التقدّم + البحث
   ================================================================ */
var toc = document.getElementById("toc");
function fmtHours(mins){
  var h = mins / 60;
  return h < 1 ? mins + " د" : (Math.round(h * 2) / 2) + " س";
}
(function buildToc(){
  var html = "";
  units.forEach(function(u, ui){
    var li = "";
    u.lessons.forEach(function(ls){
      li += '<li data-id="' + ls.id + '"><a href="#' + ls.id + '">' +
        (ls.project ? '<span class="pj">◆ </span>' : '') +
        '<span class="lt">' + escHTML(ls.title) + '</span>' +
        '<span class="mins">' + ls.minutes + 'د</span></a></li>';
    });
    html += '<div class="unit-block" data-unit="' + u.id + '">' +
      '<button class="unit-btn" type="button" aria-expanded="false"><span class="caret">▾</span>' +
      '<span class="num">' + escHTML(u.num) + '</span>' +
      '<span class="ttl">' + escHTML(u.title) + '</span>' +
      '<span class="uprog"></span></button>' +
      '<ul>' + li + '</ul></div>';
  });
  toc.innerHTML = html;
  $$(".unit-btn", toc).forEach(function(b){
    b.addEventListener("click", function(){
      var open = b.parentNode.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
})();

function openTocBlock(unitId){
  var blk = $('.unit-block[data-unit="' + unitId + '"]', toc);
  if(blk && !blk.classList.contains("open")){
    blk.classList.add("open");
    $(".unit-btn", blk).setAttribute("aria-expanded", "true");
  }
}

function refreshTocState(){
  var n = 0;
  units.forEach(function(u){
    var d = 0;
    u.lessons.forEach(function(ls){
      var on = !!state.done[ls.id];
      if(on){ d++; n++; }
      var a = $('li[data-id="' + ls.id + '"] a', toc);
      if(a) a.classList.toggle("done", on);
    });
    var up = $('.unit-block[data-unit="' + u.id + '"] .uprog', toc);
    setText(up, d ? d + "/" + u.lessons.length : "");
  });
  var total = allLessons.length;
  setText($("#progress-text"), "تقدّمك: " + n + " من " + total + " (دروس ومشاريع وتمارين)");
  var w = (total ? (n / total * 100) : 0) + "%";
  var fill = $("#progress-fill");
  if(fill.style.width !== w) fill.style.width = w;
}

/* البحث: في العناوين، ومن 3 حروف في محتوى الدروس كمان */
var search = $("#search");
var searchInfo = el("div", "search-info");
searchInfo.setAttribute("role", "status");
search.parentNode.insertBefore(searchInfo, search.nextSibling);
function lessonText(ls){
  if(ls.text === null) ls.text = (ls.node.textContent || "").toLowerCase();
  return ls.text;
}
var searchTimer = null;
search.addEventListener("input", function(){
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 160);
});
function runSearch(){
  var q = search.value.trim().toLowerCase();
  var hits = 0;
  units.forEach(function(u){
    var blk = $('.unit-block[data-unit="' + u.id + '"]', toc);
    var unitHit = q && u.title.toLowerCase().indexOf(q) > -1;
    var any = false;
    u.lessons.forEach(function(ls){
      var li = $('li[data-id="' + ls.id + '"]', toc);
      var titleHit = !q || ls.title.toLowerCase().indexOf(q) > -1;
      var bodyHit = !titleHit && q.length >= 3 && lessonText(ls).indexOf(q) > -1;
      var show = !q || unitHit || titleHit || bodyHit;
      li.style.display = show ? "" : "none";
      li.classList.toggle("body-hit", !!bodyHit);
      if(show){ any = true; if(q) hits++; }
    });
    blk.style.display = any ? "" : "none";
    if(q && any){ blk.classList.add("open"); }
  });
  searchInfo.textContent = q ? (hits ? hits + " درس فيه «" + search.value.trim() + "»" + (q.length >= 3 ? " (📄 = الكلمة في المحتوى)" : "") : "مفيش نتايج") : "";
}

/* ================================================================
   6) متابعة القراءة: الدرس الحالي + الرجوع لآخر مكان
   ================================================================ */
var crumb = $("#crumb");
var current = null;
var spyIO = { observe: function(){} };

/* الدرس اللي في أعلى الشاشة دلوقتي — بالحساب المباشر (مش محتاج IntersectionObserver) */
function syncCurrent(){
  var found = null;
  var list = $$(".unit:not([data-lazy]) .lesson");
  for(var i = 0; i < list.length; i++){
    if(list[i].getBoundingClientRect().top <= 90) found = list[i]; else break;
  }
  var id = found ? found.id : null;
  if(id === current) return;
  current = id;
  $$("a.active", toc).forEach(function(a){ a.classList.remove("active"); });
  if(!id){ setText(crumb, "كورس بايثون الشامل"); return; }
  var a = $('li[data-id="' + id + '"] a', toc);
  var info = lessonIndex[id];
  if(a){
    a.classList.add("active");
    if(sb && !sb.classList.contains("open")){
      var r = a.getBoundingClientRect(), tr = toc.getBoundingClientRect();
      if(r.top < tr.top || r.bottom > tr.bottom) a.scrollIntoView({ block: "nearest" });
    }
  }
  if(info){
    openTocBlock(info.unit.id);
    setText(crumb, info.unit.title + " › " + info.title);
  }
}

/* احتياطي للتحميل عند الحاجة لو المتصفّح ما بلّغش بالظهور */
function lazyCheck(){
  var h = window.innerHeight;
  units.forEach(function(u){
    if(u.loaded) return;
    var r = u.sec.getBoundingClientRect();
    if(r.top < h + 1200 && r.bottom > -1200) renderUnit(u);
  });
}
var tickPending = false;
window.addEventListener("scroll", function(){
  if(tickPending) return;
  tickPending = true;
  setTimeout(function(){ tickPending = false; lazyCheck(); syncCurrent(); }, 150);
}, { passive: true });
window.addEventListener("resize", function(){ lazyCheck(); });

function saveLast(){
  syncCurrent();
  if(window.scrollY < 300){ LS.del(K.last); return; }
  if(!current) return;
  var ls = document.getElementById(current);
  if(!ls) return;
  var heads = $$(":scope > h4", ls);
  var ref = ls, idx = -1;
  heads.forEach(function(h, i){ if(h.getBoundingClientRect().top <= 80){ ref = h; idx = i; } });
  var off = Math.round(70 - ref.getBoundingClientRect().top);
  LS.set(K.last, { id: current, h: idx, off: Math.max(0, off), t: Date.now() });
}
var saveTimer = null;
window.addEventListener("scroll", function(){
  if(saveTimer) return;
  saveTimer = setTimeout(function(){ saveTimer = null; saveLast(); }, 700);
}, { passive: true });
function saveEverything(){
  try{ saveLast(); }catch(e){}
  flushTime();
  flushSaves();
}
document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "hidden") saveEverything(); });
window.addEventListener("pagehide", saveEverything);

function toast(html, actions, ms){
  var t = el("div", "toast", '<div class="toast-body">' + html + '</div>');
  t.setAttribute("role", "status");
  var row = el("div", "toast-actions");
  (actions || []).forEach(function(a){
    var b = el("button", a.primary ? "primary" : "", a.label);
    b.type = "button";
    b.addEventListener("click", function(){ a.run(); t.remove(); });
    row.appendChild(b);
  });
  var x = el("button", "toast-x", "✕");
  x.type = "button";
  x.setAttribute("aria-label", "إغلاق");
  x.addEventListener("click", function(){ t.remove(); });
  row.appendChild(x);
  t.appendChild(row);
  document.body.appendChild(t);
  if(ms) setTimeout(function(){ if(t.parentNode) t.remove(); }, ms);
  return t;
}

function restoreLast(){
  var last = LS.get(K.last, null);
  if(!last || !lessonIndex[last.id]) return false;
  var info = lessonIndex[last.id];
  renderUnit(info.unit, { noAdjust: true });
  var ls = document.getElementById(last.id);
  if(!ls) return false;
  var ref = ls;
  if(last.h > -1){
    var heads = $$(":scope > h4", ls);
    if(heads[last.h]) ref = heads[last.h];
  }
  jumpTo(ref);
  instantScrollBy(last.off);
  pinNav(ref);
  toast('📍 رجّعناك لآخر مكان وقفت عنده:<br><strong>' + escHTML(info.title) + '</strong>', [
    { label: "⬆ ابدأ من أول الكورس", run: function(){ LS.del(K.last); window.scrollTo({ top: 0 }); } }
  ], 9000);
  return true;
}

/* وقت المذاكرة الفعلي لكل درس (للطالب وللمدرّس في التجربة) */
var lastActivity = Date.now();
["mousemove", "keydown", "scroll", "touchstart"].forEach(function(ev){
  window.addEventListener(ev, function(){ lastActivity = Date.now(); }, { passive: true });
});
var timeDirty = false;
setInterval(function(){
  if(document.visibilityState !== "visible" || !current) return;
  if(Date.now() - lastActivity > 120000) return;
  state.time[current] = (state.time[current] || 0) + 5;
  timeDirty = true;
}, 5000);
function flushTime(){ if(timeDirty){ save("time"); timeDirty = false; } }
setInterval(flushTime, 30000);

/* ================================================================
   7) أدوات الشريط الجانبي: تحميل الكل + تصدير واستيراد
   ================================================================ */
(function sideTools(){
  var box = el("div", "side-tools");
  box.innerHTML =
    '<button type="button" class="st-dash" title="تقدّمك ووقتك ونتايجك وأضعف الدروس">📊 لوحة تقدّمي</button>' +
    '<button type="button" class="st-offline" title="يخزّن الكورس وبايثون على جهازك عشان يشتغلوا من غير إنترنت">📴 جهّزه للأوفلاين</button>' +
    '<button type="button" class="st-all" title="للبحث بـ Ctrl+F في الكورس كله أو للطباعة">📚 حمّل الكورس كامل</button>' +
    '<button type="button" class="st-export" title="نزّل ملف فيه تقدّمك ونتايجك">📤 تصدير تقدّمي</button>' +
    '<label class="st-import" title="ارجع تقدّمك من ملف اتصدّر قبل كده">📥 استيراد<input type="file" accept="application/json" hidden></label>';
  $("#side-head").appendChild(box);
  $(".st-dash", box).addEventListener("click", function(){ openModal("لوحة تقدّمي", buildDashboard()); });
  var offBtn = $(".st-offline", box);
  offBtn.addEventListener("click", function(){ prepareOffline(offBtn); });
  $(".st-all", box).addEventListener("click", function(){
    var b = this;
    b.disabled = true;
    var i = 0;
    (function step(){
      while(i < units.length && units[i].loaded) i++;
      if(i >= units.length){ b.textContent = "✓ الكورس كله محمّل"; lazyCheck(); syncCurrent(); return; }
      b.textContent = "⏳ بنحمّل " + (i + 1) + " من " + units.length + "…";
      renderUnit(units[i]);
      setTimeout(step, 16);
    })();
  });
  $(".st-export", box).addEventListener("click", function(){
    flushTime();
    var data = {
      app: "python-course", version: 1, exportedAt: new Date().toISOString(),
      done: state.done, quiz: state.quiz, challenges: {}, checkpoints: state.cp,
      feedback: state.fb, timeSeconds: state.time, last: LS.get(K.last, null)
    };
    Object.keys(state.ch).forEach(function(k){
      var c = state.ch[k];
      data.challenges[k] = { solved: !!c.solved, tries: c.tries || 0, lastScore: c.lastScore || "", code: c.code || "" };
    });
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "python-course-progress-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
  $(".st-import input", box).addEventListener("change", function(){
    var file = this.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var d = JSON.parse(reader.result);
        if(!d || d.app !== "python-course") throw new Error("الملف ده مش ملف تقدّم الكورس");
        var obj = function(x){ return x && typeof x === "object" && !Array.isArray(x) ? x : {}; };
        ["done", "quiz", "checkpoints", "feedback", "timeSeconds", "challenges"].forEach(function(k){ d[k] = obj(d[k]); });
        if(!confirm("هنستبدل تقدّمك الحالي على الجهاز ده بالملف. نكمّل؟")) return;
        LS.set(K.done, d.done || {});
        LS.set(K.quiz, d.quiz || {});
        LS.set(K.cp, d.checkpoints || {});
        LS.set(K.fb, d.feedback || {});
        LS.set(K.time, d.timeSeconds || {});
        LS.set(K.ch, d.challenges || {});
        if(d.last) LS.set(K.last, d.last);
        location.reload();
      }catch(err){ alert("مقدرناش نقرا الملف: " + err.message); }
    };
    reader.onerror = function(){ alert("مقدرناش نقرا الملف."); };
    reader.readAsText(file);
    this.value = "";
  });
  window.addEventListener("beforeprint", renderAll);
})();

/* ================================================================
   8) الأرقام في الصفحة الرئيسية
   ================================================================ */
(function stats(){
  var codes = 0, challenges = 0, minutes = 0;
  units.forEach(function(u){
    codes += $$(".code", u.frag).length;
    challenges += $$(".challenge", u.frag).length;
    minutes += u.minutes;
  });
  var set = function(id, v){ var x = document.getElementById(id); if(x) x.textContent = v; };
  set("st-units", units.length);
  set("st-lessons", allLessons.filter(function(l){ return /-l\d+$/.test(l.id); }).length);
  set("st-projects", allLessons.filter(function(l){ return l.project; }).length);
  set("st-code", codes);
  var codeLabel = document.querySelector("#st-code + span");
  if(codeLabel) codeLabel.textContent = "مثال كود مشروح";
  set("st-challenges", challenges);
  set("st-hours", Math.round(minutes / 60));
})();

/* ================================================================
   9) القائمة على الموبايل + الثيم + زرار لفوق
   ================================================================ */
var sb = $("#sidebar"), ov = $("#overlay");
function closeMenu(){ sb.classList.remove("open"); ov.classList.remove("open"); }
var menuBtn = $("#menu-btn");
menuBtn.setAttribute("aria-controls", "sidebar");
menuBtn.setAttribute("aria-expanded", "false");
function closeMenu2(){ closeMenu(); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.addEventListener("click", function(){
  var open = sb.classList.toggle("open");
  ov.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  if(open){ var s = $("#search"); if(s && window.innerWidth >= 700) s.focus(); }
});
document.addEventListener("keydown", function(e){
  if(e.key === "Escape"){
    if(modalEl){ closeModal(); return; }
    if(sb.classList.contains("open")){ closeMenu2(); menuBtn.focus(); }
    var t = $(".toast"); if(t) t.remove();
    return;
  }
  /* اختصارات: مش بتشتغل وإنت بتكتب */
  var tag = (e.target.tagName || "").toLowerCase();
  if(e.ctrlKey || e.metaKey || e.altKey || tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
  if(e.key === "/"){
    e.preventDefault();
    if(window.innerWidth < 1000 && !sb.classList.contains("open")) menuBtn.click();
    var s = $("#search");
    if(s) s.focus();
    return;
  }
  if(e.key === "n" || e.key === "p"){
    var i = current ? allLessons.findIndex(function(x){ return x.id === current; }) : -1;
    var target = allLessons[e.key === "n" ? i + 1 : i - 1];
    if(i < 0) target = allLessons[0];
    if(target){ e.preventDefault(); goTo(target.id); }
    return;
  }
  if(e.key === "?"){
    e.preventDefault();
    var help = el("div", "help-box",
      '<ul>' +
      '<li><kbd>/</kbd> البحث</li>' +
      '<li><kbd>n</kbd> الدرس التالي · <kbd>p</kbd> السابق</li>' +
      '<li><kbd>Ctrl</kbd>+<kbd>Enter</kbd> تشغيل الكود وإنت بتعدّله</li>' +
      '<li><kbd>Esc</kbd> إغلاق النافذة أو القائمة</li>' +
      '<li><kbd>Ctrl</kbd>+<kbd>F</kbd> بحث المتصفّح (بعد «حمّل الكورس كامل»)</li>' +
      '</ul>');
    openModal("اختصارات لوحة المفاتيح", help);
  }
});
ov.addEventListener("click", closeMenu2);
toc.addEventListener("click", function(e){ if(e.target.closest("a") && window.innerWidth < 1000) closeMenu2(); });

var tb = $("#theme-btn");
if(LS.raw(K.theme) === "light") document.documentElement.setAttribute("data-theme", "light");
function paintTheme(){ tb.textContent = document.documentElement.getAttribute("data-theme") === "light" ? "☀️" : "🌙"; }
paintTheme();
tb.addEventListener("click", function(){
  var lite = document.documentElement.getAttribute("data-theme") === "light";
  if(lite) document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", "light");
  LS.setRaw(K.theme, lite ? "dark" : "light");
  paintTheme();
});

var topBtn = $("#top-btn");
var topShown = null;
function paintTop(){
  var show = window.scrollY > 700;
  if(show !== topShown){ topShown = show; topBtn.style.display = show ? "block" : "none"; }
}
window.addEventListener("scroll", paintTop, { passive: true });
paintTop();
topBtn.addEventListener("click", function(){
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
});

/* ================================================================
   10) البداية
   ================================================================ */
if("scrollRestoration" in history) history.scrollRestoration = "manual";
units.forEach(function(u){
  if(u.loaded){ enhance(u.sec, u); }
  else { paintPlaceholder(u); lazyIO.observe(u.sec); }
});
refreshTocState();
var hash = safeDecode(location.hash.slice(1));
if(!(hash && goTo(hash))) restoreLast();
lazyCheck();
syncCurrent();
if(!current) openTocBlock(units[0] && units[0].id);

/* ================================================================
   11) لوحة التقدّم + وضع المراجعة + تحسينات تنقّل وإتاحة
   ================================================================ */

/* ---------- نافذة عامة ---------- */
var modalEl = null;
function closeModal(){
  if(!modalEl) return;
  var back = modalEl._back, focus = modalEl._focus;
  modalEl.remove();
  if(back) back.remove();
  modalEl = null;
  if(focus && focus.focus) focus.focus();
}
function openModal(title, node){
  closeModal();
  var back = el("div", "modal-back");
  var box = el("div", "modal");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", title);
  var head = el("div", "modal-head", "<h3>" + escHTML(title) + "</h3>");
  var x = el("button", "modal-x", "✕");
  x.type = "button";
  x.setAttribute("aria-label", "إغلاق");
  x.addEventListener("click", closeModal);
  head.appendChild(x);
  var body = el("div", "modal-body");
  body.appendChild(node);
  box.appendChild(head);
  box.appendChild(body);
  back.addEventListener("click", closeModal);
  modalEl = box;
  box._back = back;
  box._focus = document.activeElement;
  document.body.appendChild(back);
  document.body.appendChild(box);
  x.focus();
  return box;
}

/* ---------- حساب الأرقام من التقدّم المحفوظ ---------- */
function quizStats(){
  var answered = 0, score = 0, wrongList = [];
  Object.keys(state.quiz).forEach(function(k){
    var s = state.quiz[k];
    if(!s || !s.graded) return;
    answered += s.total || 0;
    score += s.score || 0;
    (s.wrong || []).forEach(function(i){ wrongList.push({ key: k, index: i }); });
  });
  return { answered: answered, score: score, wrong: wrongList };
}
function unitStats(u){
  var done = 0, secs = 0, qTotal = 0, qScore = 0;
  u.lessons.forEach(function(ls){
    if(state.done[ls.id]) done++;
    secs += state.time[ls.id] || 0;
    Object.keys(state.quiz).forEach(function(k){
      if(k.indexOf(ls.id + ":") !== 0) return;
      var s = state.quiz[k];
      if(s && s.graded){ qTotal += s.total || 0; qScore += s.score || 0; }
    });
  });
  var chAll = 0, chDone = 0;
  $$('.challenge', u.loaded ? u.sec : u.frag).forEach(function(ch){
    chAll++;
    if((state.ch[ch.dataset.ch] || {}).solved) chDone++;
  });
  return { done: done, total: u.lessons.length, secs: secs, qTotal: qTotal, qScore: qScore, chAll: chAll, chDone: chDone };
}
function fmtMins(secs){
  var m = Math.round(secs / 60);
  if(m < 60) return m + " د";
  return Math.floor(m / 60) + " س " + (m % 60) + " د";
}

function buildDashboard(){
  var wrap = el("div", "dash");
  var q = quizStats();
  var doneCount = 0, timeAll = 0;
  allLessons.forEach(function(ls){ if(state.done[ls.id]) doneCount++; timeAll += state.time[ls.id] || 0; });
  var chAll = 0, chDone = 0;
  units.forEach(function(u){ var s = unitStats(u); chAll += s.chAll; chDone += s.chDone; });
  var pct = allLessons.length ? Math.round(doneCount / allLessons.length * 100) : 0;
  var qPct = q.answered ? Math.round(q.score / q.answered * 100) : 0;
  wrap.innerHTML =
    '<div class="dash-cards">' +
      '<div class="dash-card"><b>' + pct + '%</b><span>' + doneCount + ' من ' + allLessons.length + ' درس مكتمل</span></div>' +
      '<div class="dash-card"><b>' + fmtMins(timeAll) + '</b><span>وقت مذاكرة فعلي</span></div>' +
      '<div class="dash-card"><b>' + (q.answered ? qPct + "%" : "—") + '</b><span>' + (q.answered ? q.score + " من " + q.answered + " سؤال صح" : "لسه مجاوبتش اختبارات") + '</span></div>' +
      '<div class="dash-card"><b>' + chDone + " / " + chAll + '</b><span>تحدّي محلول</span></div>' +
    '</div>';

  /* المراجعة */
  var reviewBox = el("div", "dash-review");
  if(q.wrong.length){
    reviewBox.innerHTML = '<p>عندك <strong>' + q.wrong.length + '</strong> سؤال جاوبت عليهم غلط. المراجعة بتعيدهم عليك لوحدهم.</p>';
    var rb = el("button", "dash-btn primary", "🔁 ابدأ وضع المراجعة");
    rb.type = "button";
    rb.addEventListener("click", function(){ startReview(q.wrong); });
    reviewBox.appendChild(rb);
  } else {
    reviewBox.innerHTML = '<p>مفيش أسئلة غلط محفوظة — يا إما جاوبت كله صح، يا إما لسه ما بدأتش الاختبارات. 🙂</p>';
  }
  wrap.appendChild(reviewBox);

  /* جدول الوحدات */
  var rows = "";
  units.forEach(function(u){
    var s = unitStats(u);
    var p = s.total ? Math.round(s.done / s.total * 100) : 0;
    rows += '<tr>' +
      '<td><a href="#' + u.id + '" class="dash-link">' + escHTML(u.num + ". " + u.title) + '</a></td>' +
      '<td><div class="dash-bar"><i style="width:' + p + '%"></i></div><span class="dash-num">' + s.done + "/" + s.total + '</span></td>' +
      '<td>' + (s.secs ? fmtMins(s.secs) : "—") + '</td>' +
      '<td>' + (s.qTotal ? Math.round(s.qScore / s.qTotal * 100) + "%" : "—") + '</td>' +
      '<td>' + (s.chAll ? s.chDone + "/" + s.chAll : "—") + '</td></tr>';
  });
  var tbl = el("div", "tbl-wrap");
  tbl.innerHTML = '<table class="dash-tbl"><tr><th>الوحدة</th><th>التقدّم</th><th>الوقت</th><th>الاختبارات</th><th>التحدّيات</th></tr>' + rows + '</table>';
  wrap.appendChild(tbl);

  /* دروس محتاجة رجعة */
  var weak = [];
  Object.keys(state.fb).forEach(function(id){
    if((state.fb[id] || {}).v === -1 && lessonIndex[id]) weak.push({ id: id, why: "قلت إنه مش واضح" });
  });
  var byLesson = {};
  q.wrong.forEach(function(w){
    var id = w.key.split(":")[0];
    byLesson[id] = (byLesson[id] || 0) + 1;
  });
  Object.keys(byLesson).forEach(function(id){
    if(lessonIndex[id]) weak.push({ id: id, why: byLesson[id] + " سؤال غلط" });
  });
  if(weak.length){
    var list = "";
    weak.slice(0, 8).forEach(function(w){
      list += '<li><a href="#' + w.id + '" class="dash-link">' + escHTML(lessonIndex[w.id].title) + '</a> <span class="dash-why">' + escHTML(w.why) + '</span></li>';
    });
    var weakBox = el("div", "dash-weak", '<h4>دروس تستاهل رجعة</h4><ul>' + list + '</ul>');
    wrap.appendChild(weakBox);
  }
  wrap.addEventListener("click", function(e){
    var a = e.target.closest(".dash-link");
    if(a) closeModal();
  });
  return wrap;
}

/* ---------- وضع المراجعة: الأسئلة الغلط بس ---------- */
function startReview(wrong){
  var box = el("div", "review");
  var items = [];
  wrong.forEach(function(w){
    var lessonId = w.key.split(":")[0];
    var qn = parseInt(w.key.split(":")[1], 10);
    var info = lessonIndex[lessonId];
    if(!info) return;
    if(!info.unit.loaded) renderUnit(info.unit, { noAdjust: true });
    var art = document.getElementById(lessonId);
    if(!art) return;
    var quiz = $$(".quiz", art)[qn];
    if(!quiz) return;
    var qEl = $$(".q", quiz)[w.index];
    if(!qEl) return;
    var clone = qEl.cloneNode(true);
    $$(".mark, .sr-only, .q-feedback", clone).forEach(function(x){ x.remove(); });
    $$("label", clone).forEach(function(l){ l.classList.remove("ok", "bad"); });
    $$("input", clone).forEach(function(inp, j){
      inp.checked = false;
      inp.name = "review-" + items.length + "-" + w.index;
      inp.id = inp.name + "-" + j;
      inp.value = j;
      var lbl = inp.closest("label");
      if(lbl) lbl.setAttribute("for", inp.id);
    });
    var src = el("p", "review-src", 'من درس: <a href="#' + lessonId + '" class="dash-link">' + escHTML(info.title) + '</a>');
    var item = el("div", "review-item");
    item.appendChild(src);
    item.appendChild(clone);
    box.appendChild(item);
    items.push({ w: w, el: clone });
  });
  if(!items.length){
    box.innerHTML = "<p>مفيش أسئلة جاهزة للمراجعة.</p>";
    openModal("وضع المراجعة", box);
    return;
  }
  var bar = el("div", "review-bar");
  var check = el("button", "dash-btn primary", "صحّح المراجعة");
  check.type = "button";
  var res = el("p", "review-res");
  res.setAttribute("role", "status");
  bar.appendChild(check);
  box.appendChild(bar);
  box.appendChild(res);
  check.addEventListener("click", function(){
    var right = 0, answered = 0;
    items.forEach(function(it){
      $$(".mark, .sr-only, .q-feedback", it.el).forEach(function(x){ x.remove(); });
      $$("label", it.el).forEach(function(l){ l.classList.remove("ok", "bad"); });
      var correct = parseInt(it.el.dataset.a, 10);
      var labels = $$("label", it.el);
      var picked = $("input:checked", it.el);
      if(labels[correct]){ labels[correct].classList.add("ok"); markLabel(labels[correct], "✓", "الإجابة الصحيحة"); }
      if(!picked) return;
      answered++;
      var pickedIdx = parseInt(picked.value, 10);
      var fb = el("p", "q-feedback");
      if(pickedIdx === correct){
        right++;
        fb.classList.add("fb-ok");
        fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✓</span><strong>صح كده.</strong> شيلناه من قائمة المراجعة.';
        var st = state.quiz[it.w.key];
        if(st && st.wrong){
          st.wrong = st.wrong.filter(function(x){ return x !== it.w.index; });
          if(typeof st.score === "number") st.score = Math.min((st.total || 0), st.score + 1);
          save("quiz");
        }
      } else {
        fb.classList.add("fb-bad");
        if(labels[pickedIdx]){ labels[pickedIdx].classList.add("bad"); markLabel(labels[pickedIdx], "✗", "إجابتك، وهي خطأ"); }
        fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✗</span><strong>لسه غلط.</strong> افتح الدرس واقرا القسم اللي فيه الإجابة، وبعدين جرّب تاني.';
      }
      it.el.appendChild(fb);
    });
    res.textContent = answered
      ? "صح " + right + " من " + answered + " — اللي لسه غلط بيفضل في المراجعة."
      : "جاوب على سؤال واحد على الأقل 🙂";
  });
  openModal("وضع المراجعة — الأسئلة اللي غلطت فيها", box);
}

/* ---------- الدرس الجاي والسابق ---------- */
function enhanceNav(root){
  eachSafe($$(".lesson", root), function(ls){
    var i = allLessons.findIndex(function(x){ return x.id === ls.id; });
    if(i < 0) return;
    var prev = allLessons[i - 1], next = allLessons[i + 1];
    var nav = el("div", "lesson-nav");
    if(prev) nav.innerHTML += '<a class="lnav prev" href="#' + prev.id + '">◀ السابق: ' + escHTML(prev.title) + '</a>';
    if(next) nav.innerHTML += '<a class="lnav next" href="#' + next.id + '">التالي: ' + escHTML(next.title) + ' ▶</a>';
    if(nav.innerHTML) ls.appendChild(nav);
  });
}

/* ---------- إتاحة الرسومات النصّية ---------- */
function enhanceDiagrams(root){
  eachSafe($$(".diagram", root), function(d){
    var pre = $("pre", d), cap = $(".cap", d);
    if(!pre) return;
    pre.setAttribute("aria-hidden", "true");
    if(cap){
      d.setAttribute("role", "img");
      d.setAttribute("aria-label", "رسم توضيحي: " + cap.textContent.trim());
    }
  });
}

/* ---------- تلميح المدخلات: بناخد نص الأسئلة من الكود ---------- */
function inputPrompts(code){
  var out = [], m;
  var re = /input\s*\(\s*(?:f?)(["'])([\s\S]*?)\1/g;
  while ((m = re.exec(code))){
    out.push(m[2]
      .replace(/\\[nrt]/g, " ")            /* أحرف الهروب بتبان كنص في الكود */
      .replace(/\\(["'\\])/g, "$1")
      .replace(/\{[^}]*\}/g, "…")          /* الأجزاء المتغيّرة في الـ f-string */
      .replace(/\s+/g, " ")
      .trim());
  }
  return out;
}

window.PyCourseUI = { openDashboard: function(){ openModal("لوحة تقدّمي", buildDashboard()); }, startReview: startReview };

/* ================================================================
   12) العمل بدون إنترنت (Service Worker اختياري: ملف sw.js جنب الصفحة)
   ================================================================ */
var SW = { supported: false, reg: null };

function swAsk(type, ms){
  return new Promise(function(resolve){
    if(!navigator.serviceWorker || !navigator.serviceWorker.controller) return resolve(null);
    var ch = new MessageChannel();
    var done = false;
    var timer = setTimeout(function(){ if(!done){ done = true; resolve(null); } }, ms || 4000);
    ch.port1.onmessage = function(ev){
      if(done) return;
      done = true;
      clearTimeout(timer);
      resolve(ev.data);
    };
    try{ navigator.serviceWorker.controller.postMessage({ type: type }, [ch.port2]); }
    catch(e){ clearTimeout(timer); resolve(null); }
  });
}

function initOffline(){
  SW.supported = ("serviceWorker" in navigator) && /^https?:$/.test(location.protocol);
  if(!SW.supported) return;
  navigator.serviceWorker.register("sw.js").then(function(reg){
    SW.reg = reg;
    /* نسخة جديدة اترفعت؟ نقول للطالب بدل ما يفضل على القديمة */
    reg.addEventListener("updatefound", function(){
      var sw = reg.installing;
      if(!sw) return;
      sw.addEventListener("statechange", function(){
        if(sw.state === "installed" && navigator.serviceWorker.controller){
          toast("🆕 فيه نسخة أحدث من الكورس.", [
            { label: "حدّث الآن", primary: true, run: function(){
                sw.postMessage({ type: "SKIP_WAITING" });
                setTimeout(function(){ location.reload(); }, 300);
              } }
          ]);
        }
      });
    });
  }).catch(function(err){
    if(window.console) console.info("offline mode unavailable:", err && err.message);
  });
}

function fmtBytes(n){
  if(!n) return "—";
  if(n < 1024 * 1024) return Math.round(n / 1024) + " ك.بايت";
  return (n / (1024 * 1024)).toFixed(1) + " ميجا";
}

/* يجهّز الكورس للعمل أوفلاين: الصفحة + ملفات بايثون */
function prepareOffline(btn){
  if(!SW.supported){
    toast("📴 العمل بدون إنترنت محتاج تفتح الكورس من استضافة (https أو localhost) — مش بفتح الملف مباشرةً من الجهاز (file://).", [], 12000);
    return;
  }
  var setLabel = function(t){ if(btn) btn.textContent = t; };
  if(btn) btn.disabled = true;
  setLabel("⏳ بنجهّز…");
  var ready = navigator.serviceWorker.ready;
  ready.then(function(){
    /* نتأكّد إن الصفحة نفسها متخزّنة */
    return fetch(location.pathname, { cache: "reload" }).catch(function(){});
  }).then(function(){
    setLabel("⏳ بنحمّل بايثون…");
    /* تشغيل صامت مرّة واحدة = تحميل Pyodide ومروره على الـ Service Worker */
    return pyCall({ kind: "run", code: "print(1)", ns: "offline-warmup" }, { timeout: 180000 });
  }).then(function(){
    return swAsk("STATUS", 5000);
  }).then(function(status){
    var estimate = (navigator.storage && navigator.storage.estimate) ? navigator.storage.estimate() : Promise.resolve(null);
    return estimate.then(function(est){
      var size = est && est.usage ? " · المساحة المستخدمة: " + fmtBytes(est.usage) : "";
      var files = status ? " · " + (status.runtime + status.shell) + " ملف متخزّن" : "";
      setLabel("✓ جاهز أوفلاين");
      if(btn) btn.disabled = false;
      toast("📴 تمام — الكورس وبايثون متخزّنين على الجهاز. تقدر تفتحه وتشغّل الأكواد من غير إنترنت." + files + size, [], 12000);
    });
  }).catch(function(err){
    setLabel("📴 جهّزه للأوفلاين");
    if(btn) btn.disabled = false;
    toast("⚠️ مقدرناش نكمّل التجهيز: " + friendlyError(err), [], 10000);
  });
}

initOffline();

window.PyCourse = { units: units, renderAll: renderAll, goTo: goTo, pyCall: pyCall, state: state,
  useMainThread: switchToMain, mode: function(){ return PY.mode; } };
})();
