/* ============================================================================
   features/resume — «يبدأ من حيث انتهى» + وقت المذاكرة الفعلي
   بنحفظ آخر مكان (الدرس + العنوان الفرعي + الإزاحة) ونرجّعه عند الفتح.
   ============================================================================ */
import { $$, escHTML } from "../core/dom.js";
import { storage, KEYS } from "../core/storage.js";
import { state, save, flushSaves } from "../core/state.js";
import { jumpTo, scrollBy, pin } from "../core/scroll.js";
import { course } from "../data/course.js";
import { renderUnit } from "./render.js";
import { currentLesson, syncCurrent } from "./navigation.js";
import { toast } from "../ui/toast.js";

export function saveLast() {
  syncCurrent();
  if (window.scrollY < 300) { storage.del(KEYS.last); return; }
  const id = currentLesson();
  if (!id) return;
  const lessonEl = document.getElementById(id);
  if (!lessonEl) return;

  const heads = $$(":scope > h4", lessonEl);
  let ref = lessonEl, idx = -1;
  heads.forEach((h, i) => {
    if (h.getBoundingClientRect().top <= 80) { ref = h; idx = i; }
  });
  const off = Math.round(70 - ref.getBoundingClientRect().top);
  storage.set(KEYS.last, { id, h: idx, off: Math.max(0, off), t: Date.now() });
}

export async function restoreLast() {
  const last = storage.get(KEYS.last, null);
  if (!last || !course().lesson(last.id)) return false;
  const info = course().lesson(last.id);
  try { await renderUnit(info.unit, { noAdjust: true }); } catch (e) { return false; }

  const lessonEl = document.getElementById(last.id);
  if (!lessonEl) return false;
  let ref = lessonEl;
  if (last.h > -1) {
    const heads = $$(":scope > h4", lessonEl);
    if (heads[last.h]) ref = heads[last.h];
  }
  const margin = jumpTo(ref);
  scrollBy(last.off);
  pin(ref, margin - (last.off || 0));
  toast("📍 رجّعناك لآخر مكان وقفت عنده:<br><strong>" + escHTML(info.title) + "</strong>", [
    { label: "⬆ ابدأ من أول الكورس", run: () => { storage.del(KEYS.last); window.scrollTo({ top: 0 }); } }
  ], 9000);
  return true;
}

/* وقت المذاكرة: بنعدّ 5 ثواني كل مرّة والطالب فعلًا موجود ونشيط */
let lastActivity = Date.now();
let timeDirty = false;

export function flushTime() {
  if (timeDirty) { save("time"); timeDirty = false; }
}

export function initResume() {
  ["mousemove", "keydown", "scroll", "touchstart"].forEach(ev => {
    window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true });
  });

  setInterval(() => {
    const id = currentLesson();
    if (document.visibilityState !== "visible" || !id) return;
    if (Date.now() - lastActivity > 120000) return;
    state.time[id] = (state.time[id] || 0) + 5;
    timeDirty = true;
  }, 5000);
  setInterval(flushTime, 30000);

  let saveTimer = null;
  window.addEventListener("scroll", () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; saveLast(); }, 700);
  }, { passive: true });

  const saveEverything = () => {
    try { saveLast(); } catch (e) {}
    flushTime();
    flushSaves();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveEverything();
  });
  window.addEventListener("pagehide", saveEverything);
}
