/* ============================================================================
   features/navigation — كل تنقّل في الكورس بيعدّي من هنا
     • أي رابط #id بيحمّل وحدته الأول وبعدين يقفز عليه
     • تثبيت الهدف بعد القفزة لحد ما الصفحة تستقرّ
     • متابعة الدرس اللي قدّام الطالب دلوقتي (للفهرس والمسار)
   ============================================================================ */
import { $, $$, setText, safeDecode } from "../core/dom.js";
import { emit } from "../core/bus.js";
import { jumpTo, scrollBy, pin } from "../core/scroll.js";
import { course } from "../data/course.js";
import { renderUnit, lazyCheck } from "./render.js";

let crumbEl = null;
let currentId = null;

export function currentLesson() { return currentId; }

export async function goTo(id, extraOffset) {
  const unit = course().unitFor(id);
  if (unit && !unit.loaded) {
    document.documentElement.classList.add("unit-loading");
    setText(crumbEl, "⏳ بنجهّز " + unit.title + "…");
    try { await renderUnit(unit, { noAdjust: true }); }
    finally { document.documentElement.classList.remove("unit-loading"); }
  }
  const target = document.getElementById(id);
  if (!target) { syncCurrent(); return false; }

  const closed = target.closest && target.closest("details:not([open])");
  if (closed) closed.open = true;

  const margin = jumpTo(target);
  scrollBy(extraOffset);
  pin(target, margin - (extraOffset || 0));
  syncCurrent();
  /* الرابط في شريط العنوان يفضل مطابق للمكان — أي تنقّل (رابط، لوحة مفاتيح، استرجاع) */
  try { history.replaceState(null, "", "#" + encodeURIComponent(id)); } catch (err) {}
  return true;
}

/* الدرس اللي في أعلى الشاشة دلوقتي */
export function syncCurrent() {
  let found = null;
  const list = $$(".unit:not([data-lazy]) .lesson");
  for (const node of list) {
    if (node.getBoundingClientRect().top <= 90) found = node;
    else break;
  }
  const id = found ? found.id : null;
  if (id === currentId) return;
  currentId = id;

  if (!id) { setText(crumbEl, "كورس بايثون الشامل"); emit("lesson:current", null); return; }
  const info = course().lesson(id);
  if (info) setText(crumbEl, info.unit.title + " › " + info.title);
  emit("lesson:current", id);
}

export function initNavigation() {
  crumbEl = $("#crumb");

  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = safeDecode(a.getAttribute("href").slice(1));
    if (!id) return;
    e.preventDefault();
    goTo(id);
  });

  window.addEventListener("hashchange", () => {
    const id = safeDecode(location.hash.slice(1));
    if (id) goTo(id);
  });

  /* تمرير: نحمّل الوحدات القريبة ونحدّث الدرس الحالي */
  let tick = false;
  window.addEventListener("scroll", () => {
    if (tick) return;
    tick = true;
    setTimeout(() => { tick = false; lazyCheck(); syncCurrent(); }, 150);
  }, { passive: true });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
}
