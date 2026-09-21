/* ============================================================================
   features/run-panel — لوحة تشغيل الكود تحت كل مثال
   بتربط بين بلوك الكود (DOM) ومشغّل بايثون (runtime/python).
   ============================================================================ */
import { $, $$, el, escHTML } from "../core/dom.js";
import { state, save, saveSoon } from "../core/state.js";
import { run, kill, onStatus, friendlyError } from "../runtime/python.js";
import { runnability, scriptName, lessonFiles, inputPrompts } from "../runtime/runnability.js";
import { makeEditor } from "./editor.js";

export function outputHTML(data) {
  let html = "";
  let out = data.out !== undefined ? String(data.out) : "";
  const MAX_OUT = 60000;
  const cut = out.length > MAX_OUT;
  if (cut) out = out.slice(0, MAX_OUT - 3000) + "\n\n… (اتشال جزء من النص) …\n\n" + out.slice(-3000);
  if (!out.trim() && !(data.images || []).length) out = "(البرنامج اشتغل وما طبعش حاجة)";

  html += '<pre class="' + (data.failed ? "has-err" : "") + '">' + escHTML(out) + "</pre>";
  if (cut) html += '<p class="run-hint">✂️ الناتج طويل جدًا فعرضنا أوله وآخره بس.</p>';
  (data.images || []).forEach(img => {
    html += '<figure class="run-img"><img alt="صورة ولّدها الكود: ' + escHTML(img[0]) +
      '" src="data:image/png;base64,' + img[1] + '"><figcaption>' + escHTML(img[0]) + "</figcaption></figure>";
  });
  if (data.failed && /EOFError/.test(out))
    html += '<p class="run-hint">💡 البرنامج طلب إدخال (<code class="inl">input</code>) ومفيش مدخلات. اكتبها في خانة «المدخلات» — كل سطر لـ input واحد — وشغّل تاني.</p>';
  else if (data.failed && /NameError/.test(out))
    html += '<p class="run-hint">💡 لو المتغيّر أو الدالة متعرّفين في مثال قبل ده في نفس الدرس، شغّل المثال ده الأول.</p>';
  if (data.pipError)
    html += '<p class="run-hint">📦 المكتبة دي مش متاحة جوّه المتصفّح — جرّب الكود على جهازك بعد <code class="inl">pip install</code>.</p>';
  return html;
}

export function attachRunner(box, pre, lessonId, blockKey) {
  const raw = pre.dataset.raw;
  const can = runnability(box, raw);
  const head = $(".code-head", box);

  if (!can.ok) {
    if (can.why) {
      const note = el("span", "run-na", "💻 على جهازك");
      note.title = can.why;
      note.setAttribute("aria-label", can.why);
      head.insertBefore(note, head.querySelector(".copy-btn"));
    }
    return;
  }

  /* الكود ممكن يتعدّل، فبنسأل عن المدخلات وقت التشغيل مش مرّة واحدة */
  const wantsInput = code => /\binput\s*\(/.test(code);
  const runBtn = el("button", "run-btn", "▶ شغّل");
  runBtn.type = "button";
  runBtn.title = "شغّل الكود جوّه الصفحة (Ctrl+Enter وإنت بتعدّل)";
  const editBtn = el("button", "edit-btn", "✏️ عدّل");
  editBtn.type = "button";
  head.insertBefore(editBtn, head.querySelector(".copy-btn"));
  head.insertBefore(runBtn, editBtn);

  let editor = null, panel = null, outBox = null, stdinBox = null, stdinLbl = null, stdinHint = null,
    statusLine = null, stopBtn = null;
  const currentCode = () => (editor ? editor.value : raw);

  /* بنظهر خانة المدخلات ونحدّث أسئلتها حسب الكود اللي هيتشغّل دلوقتي */
  function syncStdin(code) {
    const needs = wantsInput(code);
    stdinLbl.hidden = !needs;
    if (!needs) return false;
    const prompts = inputPrompts(code);
    stdinHint.innerHTML = prompts.length
      ? "الكود هيسأل بالترتيب: " + prompts.map((t, i) => (i + 1) + ") " + escHTML(t || "مدخل")).join(" · ")
      : "";
    stdinHint.hidden = !prompts.length;
    stdinBox.rows = Math.min(4, Math.max(2, prompts.length || 2));
    return true;
  }

  function ensurePanel() {
    if (panel) return;
    panel = el("div", "run-panel");
    panel.innerHTML =
      '<div class="run-head"><span class="rt">🧪 ناتج التشغيل جوّه المتصفّح</span>' +
      '<button type="button" class="run-stop" hidden>⏹ إيقاف</button>' +
      '<button type="button" class="run-reset" title="امسح المتغيّرات والملفات اللي اتعملت في أمثلة الدرس ده">↺ ذاكرة جديدة</button>' +
      '<button type="button" class="run-close" aria-label="إغلاق الناتج">✕</button></div>' +
      '<label class="stdin-lbl" hidden>📥 المدخلات (كل سطر = <code class="inl">input</code> واحد)' +
        '<span class="stdin-hint" hidden></span>' +
        '<textarea class="stdin" dir="auto" rows="2" placeholder="سطر لكل سؤال"></textarea></label>' +
      '<p class="run-status" role="status" aria-live="polite"></p>' +
      '<div class="run-out"></div>';

    let anchor = box;
    while (anchor.nextElementSibling && anchor.nextElementSibling.classList.contains("out")) anchor = anchor.nextElementSibling;
    anchor.parentNode.insertBefore(panel, anchor.nextSibling);

    outBox = $(".run-out", panel);
    stdinBox = $(".stdin", panel);
    stdinLbl = $(".stdin-lbl", panel);
    stdinHint = $(".stdin-hint", panel);
    statusLine = $(".run-status", panel);
    stopBtn = $(".run-stop", panel);

    stopBtn.addEventListener("click", () => kill("stopped"));
    $(".run-close", panel).addEventListener("click", () => { panel.hidden = true; });
    $(".run-reset", panel).addEventListener("click", () => {
      run({ kind: "reset", ns: lessonId, code: "" }).then(
        () => { statusLine.textContent = "✓ ذاكرة الدرس اتمسحت — المتغيّرات والملفات اللي اتعملت في الدرس ده رجعت من الأول."; },
        err => { statusLine.textContent = friendlyError(err); }
      );
    });

    const saved = (state.edits[blockKey] || {}).stdin;
    if (saved) stdinBox.value = saved;
    stdinBox.addEventListener("input", () => {
      state.edits[blockKey] = state.edits[blockKey] || {};
      state.edits[blockKey].stdin = stdinBox.value;
      saveSoon("edits");
    });
  }

  function execute() {
    ensurePanel();
    panel.hidden = false;
    const code = currentCode();
    const needsInput = syncStdin(code);
    if (needsInput && !stdinBox.value.trim()) {
      statusLine.textContent = "📥 الكود ده بيطلب مدخلات بـ input — اكتبها في الخانة (كل سطر لمدخل) ثم اضغط ▶ تاني.";
      stdinBox.focus();
      if (panel._askedFor !== code) { panel._askedFor = code; return; }
    }
    runBtn.disabled = true;
    runBtn.textContent = "⏳ بيشتغل…";
    outBox.innerHTML = "";
    statusLine.textContent = "⏳ بنجهّز التشغيل…";
    const unsub = onStatus(t => { if (t) statusLine.textContent = t; });

    run({
      kind: "run", code,
      stdin: needsInput ? stdinBox.value : "",
      ns: lessonId,
      files: lessonFiles(lessonId, code, box),
      filename: scriptName(box)
    }, {
      onStart: () => { stopBtn.hidden = false; statusLine.textContent = "▶ شغّال…"; }
    }).then(data => {
      outBox.innerHTML = outputHTML(data);
      statusLine.textContent = data.failed ? "✗ الكود وقع — اقرا رسالة الخطأ من تحت لفوق." : "✓ اتشغّل بنجاح.";
    }, err => {
      outBox.innerHTML = "";
      statusLine.textContent = friendlyError(err);
    }).then(() => {
      unsub();
      stopBtn.hidden = true;
      runBtn.disabled = false;
      runBtn.textContent = "▶ شغّل";
    });
  }

  function openEditor() {
    if (editor) return;
    const saved = (state.edits[blockKey] || {}).code;
    editor = makeEditor(saved !== undefined ? saved : raw, "تعديل الكود");
    pre.hidden = true;
    box.appendChild(editor);
    const bar = el("div", "edit-bar",
      "<span>✏️ بتعدّل نسخة ليك — الأصل محفوظ. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> للتشغيل</span>" +
      '<button type="button" class="edit-restore">↺ رجّع الأصل</button>' +
      '<button type="button" class="edit-done">✓ خلّصت التعديل</button>');
    box.appendChild(bar);
    editBtn.textContent = "📄 الأصل";

    editor.addEventListener("keydown", e => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); execute(); }
    });
    editor.addEventListener("input", () => {
      state.edits[blockKey] = state.edits[blockKey] || {};
      state.edits[blockKey].code = editor.value;
      saveSoon("edits");
    });
    $(".edit-restore", bar).addEventListener("click", () => {
      editor.value = raw;
      editor.fit();
      if (state.edits[blockKey]) { delete state.edits[blockKey].code; save("edits"); }
    });
    $(".edit-done", bar).addEventListener("click", closeEditor);
    editor.focus();
  }

  function closeEditor() {
    if (!editor) return;
    const changed = editor.value !== raw;
    box.removeChild(editor);
    box.removeChild($(".edit-bar", box));
    editor = null;
    pre.hidden = false;
    editBtn.textContent = changed ? "✏️ عدّل (فيه تعديل محفوظ)" : "✏️ عدّل";
  }

  runBtn.addEventListener("click", execute);
  editBtn.addEventListener("click", () => (editor ? closeEditor() : openEditor()));

  /* المثال بيكمّل على اللي قبله: زرار بيشغّل اللي قبله بالترتيب وبعدين ده */
  const dependent = box.previousElementSibling && box.previousElementSibling.classList.contains("dep-note");
  if (dependent) {
    const chainBtn = el("button", "chain-btn", "⏩ شغّل من أول الدرس");
    chainBtn.type = "button";
    chainBtn.title = "بيشغّل الأمثلة اللي قبله في نفس الدرس بالترتيب، وبعدين المثال ده";
    head.insertBefore(chainBtn, editBtn);
    chainBtn.addEventListener("click", async () => {
      const lesson = box.closest(".lesson");
      const boxes = $$(".code", lesson);
      const before = boxes.slice(0, boxes.indexOf(box)).filter(b => {
        const p = $("pre", b);
        return b.querySelector(".run-btn") && p && !/\binput\s*\(/.test(p.dataset.raw || "");
      });
      ensurePanel();
      panel.hidden = false;
      chainBtn.disabled = true;
      statusLine.textContent = "⏳ بنشغّل " + before.length + " مثال قبله…";
      for (const b of before) {
        const code = ($(".code-editor", b) || {}).value || $("pre", b).dataset.raw;
        try {
          await run({ kind: "run", code, stdin: "", ns: lessonId, files: lessonFiles(lessonId, code, b), filename: scriptName(b) });
        } catch (e) { /* نكمّل حتى لو مثال وقع */ }
      }
      chainBtn.disabled = false;
      execute();
    });
  }

  if (state.edits[blockKey] && state.edits[blockKey].code !== undefined)
    editBtn.textContent = "✏️ عدّل (فيه تعديل محفوظ)";
}
