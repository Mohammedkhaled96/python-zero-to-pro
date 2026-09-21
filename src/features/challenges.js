/* ============================================================================
   features/challenges — التحدّيات المصحَّحة آليًا
   الطالب بيكتب حلّه، والاختبارات بتشتغل في بايثون وترجّع نتيجة كل اختبار.
   ============================================================================ */
import { $, $$, el, escHTML, eachSafe } from "../core/dom.js";
import { state, save, saveSoon } from "../core/state.js";
import { emit } from "../core/bus.js";
import { run, onStatus, friendlyError } from "../runtime/python.js";
import { makeEditor } from "./editor.js";
import { outputHTML } from "./run-panel.js";

export function enhanceChallenges(root) {
  eachSafe($$(".challenge", root), ch => {
    const id = ch.dataset.ch;
    const starterEl = $(".ch-starter", ch);
    const testsEl = $(".ch-tests", ch);
    if (!starterEl || !testsEl) return;

    const starter = starterEl.value.replace(/^\n/, "");
    const tests = testsEl.textContent;
    const head = $(".ch-head", ch);
    const badge = el("span", "ch-badge");
    if (head) head.appendChild(badge);

    function paintBadge() {
      const st = state.ch[id] || {};
      badge.textContent = st.solved ? "✓ اتحل" : (st.tries ? "محاولات: " + st.tries : "");
      badge.className = "ch-badge" + (st.solved ? " solved" : "");
      ch.classList.toggle("solved", !!st.solved);
    }
    paintBadge();

    const saved = state.ch[id] || {};
    const editor = makeEditor(saved.code !== undefined ? saved.code : starter, "كود الحل الخاص بيك");
    const tools = el("div", "ch-tools",
      '<button type="button" class="ch-run">✅ اختبر حلّي</button>' +
      '<button type="button" class="ch-try">▶ شغّل بس</button>' +
      '<button type="button" class="ch-reset">↺ ابدأ من جديد</button>' +
      '<span class="ch-kbd"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> للاختبار</span>');
    const status = el("p", "ch-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const results = el("div", "ch-results");

    starterEl.parentNode.insertBefore(editor, starterEl);
    editor.fit();                     /* الحجم النهائي فورًا: التوسّع المتأخّر بيزحلق اللي تحته */
    editor.parentNode.insertBefore(tools, editor.nextSibling);
    tools.parentNode.insertBefore(status, tools.nextSibling);

    /* برامج بتقرا input: خانة مدخلات لزرار «شغّل بس» */
    let chStdin = null;
    if (/PROGRAM_MODE|\binput\s*\(/.test(tests + "\n" + starter)) {
      const label = el("label", "stdin-lbl ch-stdin",
        '📥 مدخلات للتجربة مع «▶ شغّل بس» (كل سطر = <code class="inl">input</code> واحد)' +
        '<textarea class="stdin" dir="auto" rows="2"></textarea>');
      tools.parentNode.insertBefore(label, tools);
      chStdin = $("textarea", label);
      if (saved.stdin) chStdin.value = saved.stdin;
      chStdin.addEventListener("input", () => {
        const s = state.ch[id] || {};
        s.stdin = chStdin.value;
        state.ch[id] = s;
        saveSoon("ch");
      });
    }
    status.parentNode.insertBefore(results, status.nextSibling);

    /* الحل النموذجي مقفول لحد أول محاولة */
    const sol = $("details.sol", ch);
    if (sol) {
      $("summary", sol).addEventListener("click", e => {
        const s = state.ch[id] || {};
        if (!sol.open && !s.tries) {
          e.preventDefault();
          status.textContent = "🔒 الحل هيتفتح بعد أول محاولة — اكتب حلّك واضغط «اختبر حلّي» مرّة على الأقل.";
        }
      });
    }

    function persist(extra, later) {
      const s = state.ch[id] || {};
      s.code = editor.value;
      if (extra) Object.keys(extra).forEach(k => { s[k] = extra[k]; });
      state.ch[id] = s;
      if (later) saveSoon("ch"); else save("ch");
    }

    editor.addEventListener("input", () => persist(null, true));
    editor.addEventListener("keydown", e => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); check(); }
    });

    let busy = false;
    function lock(on, label) {
      busy = on;
      $$("button", tools).forEach(b => { b.disabled = on; });
      if (label) status.textContent = label;
    }

    function check() {
      if (busy) return;
      lock(true, "⏳ بنشغّل الاختبارات…");
      results.innerHTML = "";
      const unsub = onStatus(t => { if (t) status.textContent = t; });

      run({ kind: "test", code: editor.value, tests }, { timeout: 15000 }).then(r => {
        const s = state.ch[id] || {};
        const tries = (s.tries || 0) + 1;
        if (r.crash) {
          results.innerHTML = '<p class="ch-crash">💥 الكود وقع قبل ما الاختبارات تبدأ:</p><pre class="has-err">' + escHTML(r.crash) + "</pre>";
          status.textContent = "✗ صلّح الخطأ ده الأول (اقرا آخر سطر فيه).";
          persist({ tries });
          paintBadge();
          return;
        }
        const ok = r.tests.filter(t => t[1]).length;
        let html = '<ul class="ch-list">';
        r.tests.forEach(t => {
          html += '<li class="' + (t[1] ? "pass" : "fail") + '"><span class="ic" aria-hidden="true">' + (t[1] ? "✓" : "✗") + "</span>" +
            '<span class="sr-only">' + (t[1] ? "نجح: " : "فشل: ") + "</span>" + escHTML(t[0]) +
            (t[1] ? "" : '<div class="why">' + escHTML(t[2]) + "</div>") + "</li>";
        });
        html += "</ul>";
        if (r.output && r.output.trim())
          html += '<details class="ch-out"><summary>اللي كودك طبعه</summary><pre>' + escHTML(r.output) + "</pre></details>";
        results.innerHTML = html;

        const all = ok === r.tests.length && r.tests.length > 0;
        status.textContent = all
          ? "🎉 كل الاختبارات نجحت (" + ok + "/" + r.tests.length + ") — حل ممتاز! قارن حلّك بالحل النموذجي."
          : "نجح " + ok + " من " + r.tests.length + " — اقرا سبب الفشل تحت كل اختبار وعدّل.";
        persist({ tries, solved: s.solved || all, lastScore: ok + "/" + r.tests.length });
        paintBadge();
        emit("progress:changed");
      }, err => {
        status.textContent = friendlyError(err);
      }).then(() => { unsub(); lock(false); });
    }

    function tryRun() {
      if (busy) return;
      lock(true, "⏳ بنشغّل كودك…");
      const unsub = onStatus(t => { if (t) status.textContent = t; });
      run({ kind: "run", code: editor.value, stdin: chStdin ? chStdin.value : "", ns: "challenge:" + id }, { timeout: 15000 })
        .then(data => {
          results.innerHTML = '<div class="run-out">' + outputHTML(data) + "</div>";
          status.textContent = data.failed ? "✗ الكود وقع." : "✓ اتشغّل — ده الناتج (مش تصحيح). اضغط «اختبر حلّي» للتقييم.";
          run({ kind: "reset", ns: "challenge:" + id, code: "" }).catch(() => {});
        }, err => { status.textContent = friendlyError(err); })
        .then(() => { unsub(); lock(false); });
    }

    $(".ch-run", tools).addEventListener("click", check);
    $(".ch-try", tools).addEventListener("click", tryRun);
    $(".ch-reset", tools).addEventListener("click", () => {
      editor.value = starter;
      editor.fit();
      persist();
      results.innerHTML = "";
      status.textContent = "↺ رجعنا لكود البداية.";
    });
  });
}
