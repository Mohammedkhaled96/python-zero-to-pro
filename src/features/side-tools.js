/* ============================================================================
   features/side-tools — أدوات الشريط الجانبي
   لوحة التقدّم · التجهيز للأوفلاين · تحميل الكورس كامل · تصدير واستيراد التقدّم
   ============================================================================ */
import { $, el } from "../core/dom.js";
import { storage, KEYS } from "../core/storage.js";
import { state } from "../core/state.js";
import { course } from "../data/course.js";
import { renderAll } from "./render.js";
import { lazyCheck } from "./render.js";
import { syncCurrent } from "./navigation.js";
import { openDashboard } from "./dashboard.js";
import { prepareOffline } from "./offline.js";
import { flushTime } from "./resume.js";

export function initSideTools() {
  const box = el("div", "side-tools");
  box.innerHTML =
    '<button type="button" class="st-dash" title="تقدّمك ووقتك ونتايجك وأضعف الدروس">📊 لوحة تقدّمي</button>' +
    '<button type="button" class="st-offline" title="يخزّن الكورس وبايثون على جهازك عشان يشتغلوا من غير إنترنت">📴 جهّزه للأوفلاين</button>' +
    '<button type="button" class="st-all" title="للبحث بـ Ctrl+F في الكورس كله أو للطباعة">📚 حمّل الكورس كامل</button>' +
    '<button type="button" class="st-export" title="نزّل ملف فيه تقدّمك ونتايجك">📤 تصدير تقدّمي</button>' +
    '<label class="st-import" title="ارجع تقدّمك من ملف اتصدّر قبل كده">📥 استيراد<input type="file" accept="application/json" hidden></label>';
  $("#side-head").appendChild(box);

  $(".st-dash", box).addEventListener("click", openDashboard);

  const offlineBtn = $(".st-offline", box);
  offlineBtn.addEventListener("click", () => prepareOffline(offlineBtn));

  const allBtn = $(".st-all", box);
  allBtn.addEventListener("click", async () => {
    allBtn.disabled = true;
    await renderAll((i, total) => { allBtn.textContent = "⏳ بنحمّل " + i + " من " + total + "…"; });
    allBtn.textContent = "✓ الكورس كله محمّل";
    lazyCheck();
    syncCurrent();
  });

  $(".st-export", box).addEventListener("click", () => {
    flushTime();
    const data = {
      app: "python-course", version: 1, exportedAt: new Date().toISOString(),
      done: state.done, quiz: state.quiz, challenges: {}, checkpoints: state.cp,
      feedback: state.fb, timeSeconds: state.time, last: storage.get(KEYS.last, null)
    };
    Object.keys(state.ch).forEach(k => {
      const c = state.ch[k];
      data.challenges[k] = { solved: !!c.solved, tries: c.tries || 0, lastScore: c.lastScore || "", code: c.code || "" };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "python-course-progress-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });

  $(".st-import input", box).addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (!d || d.app !== "python-course") throw new Error("الملف ده مش ملف تقدّم الكورس");
        const obj = x => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
        ["done", "quiz", "checkpoints", "feedback", "timeSeconds", "challenges"].forEach(k => { d[k] = obj(d[k]); });
        if (!confirm("هنستبدل تقدّمك الحالي على الجهاز ده بالملف. نكمّل؟")) return;
        storage.set(KEYS.done, d.done);
        storage.set(KEYS.quiz, d.quiz);
        storage.set(KEYS.cp, d.checkpoints);
        storage.set(KEYS.fb, d.feedback);
        storage.set(KEYS.time, d.timeSeconds);
        storage.set(KEYS.ch, d.challenges);
        if (d.last) storage.set(KEYS.last, d.last);
        location.reload();
      } catch (err) {
        alert("مقدرناش نقرا الملف: " + err.message);
      }
    };
    reader.onerror = () => alert("مقدرناش نقرا الملف.");
    reader.readAsText(file);
    this.value = "";
  });

  /* الطباعة محتاجة الكورس كله في الصفحة */
  window.addEventListener("beforeprint", () => { renderAll(); });
}

/* أرقام الصفحة الرئيسية من المانيفست (من غير ما نحمّل أي وحدة) */
export function paintHeroStats() {
  const s = course().stats;
  const set = (id, v) => { const x = document.getElementById(id); if (x) x.textContent = v; };
  set("st-units", s.units);
  set("st-lessons", s.lessons);
  set("st-projects", s.projects);
  set("st-code", s.code);
  set("st-challenges", s.challenges);
  set("st-hours", s.hours);
}
