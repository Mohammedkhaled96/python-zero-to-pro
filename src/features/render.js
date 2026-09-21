/* ============================================================================
   features/render — رسم الوحدات في الصفحة عند الحاجة
   المسؤولية: يجيب محتوى الوحدة من طبقة البيانات، يحطّه في الصفحة، يشغّل
   كل مزايا الدرس عليه، ويحافظ على مكان الطالب من التزحلق.
   ============================================================================ */
import { $$, el, escHTML } from "../core/dom.js";
import { emit } from "../core/bus.js";
import { anchor, keepAnchor } from "../core/scroll.js";
import { course } from "../data/course.js";
import { loadUnitContent, prefetchUnit } from "../data/content.js";
import { enhanceCode } from "./code-blocks.js";
import { enhanceQuizzes, enhanceSolutions } from "./quiz.js";
import { enhanceChallenges } from "./challenges.js";
import { enhanceMiniToc, enhanceDiagrams, enhanceCheckpoints, enhanceLessonFoot, enhanceLessonNav } from "./lesson-extras.js";

/* نسبة بكسل/حرف لتقدير ارتفاع الوحدات اللي لسه ما اترسمتش — بتتعلّم من اللي اترسم */
const ratio = { px: 0, chars: 0 };
const estHeight = u => Math.max(500, Math.round(u.chars * (ratio.chars > 20000 ? ratio.px / ratio.chars : 0.3)));

const pending = new Map();

export function createUnitSections(container) {
  container.innerHTML = "";
  course().units.forEach(u => {
    const sec = el("section", "unit");
    sec.id = u.id;
    sec.dataset.num = u.num;
    sec.setAttribute("data-lazy", "");
    u.sec = sec;
    paintPlaceholder(u);
    container.appendChild(sec);
  });
}

function paintPlaceholder(u) {
  u.sec.innerHTML =
    '<div class="unit-ph" aria-busy="true">' +
      '<div class="kicker">' + escHTML(u.kicker) + "</div>" +
      "<h2>" + escHTML(u.title) + "</h2>" +
      "<p>⏳ الوحدة بتتجهّز…</p>" +
    "</div>";
  u.sec.style.minHeight = estHeight(u) + "px";
}

function paintError(u, err) {
  u.sec.innerHTML =
    '<div class="unit-ph unit-err">' +
      "<h2>" + escHTML(u.title) + "</h2>" +
      "<p>⚠️ مقدرناش نحمّل الوحدة دي. اتأكّد من الاتصال واضغط إعادة المحاولة.</p>" +
      '<button type="button" class="dash-btn primary">↻ حاول تاني</button>' +
    "</div>";
  u.sec.querySelector("button").addEventListener("click", () => { paintPlaceholder(u); renderUnit(u); });
  console.error("[course] unit", u.id, err);
}

/* بيرجّع Promise بيخلص لما الوحدة تبقى جاهزة في الصفحة */
export function renderUnit(u, opts = {}) {
  if (u.loaded) return Promise.resolve(u);
  if (pending.has(u.id)) return pending.get(u.id);

  const job = loadUnitContent(u).then(({ html, notes }) => {
    if (u.loaded) return u;
    const keep = opts.noAdjust ? null : anchor(u.sec);
    u.sec.innerHTML = html;
    u.sec.style.minHeight = "";
    u.sec.removeAttribute("data-lazy");
    u.loaded = true;

    try { enhanceUnit(u.sec, notes); }
    catch (err) { console.error("[course] enhance", u.id, err); }

    ratio.px += u.sec.getBoundingClientRect().height;
    ratio.chars += u.chars;
    keepAnchor(keep);
    pending.delete(u.id);
    emit("unit:rendered", u);
    prefetchNeighbours(u);
    return u;
  }).catch(err => {
    pending.delete(u.id);
    paintError(u, err);
    throw err;
  });

  pending.set(u.id, job);
  return job;
}

/* كل المزايا اللي بتشتغل على محتوى درس */
function enhanceUnit(root, notes) {
  enhanceMiniToc(root);
  enhanceDiagrams(root);
  enhanceCode(root, notes);
  enhanceQuizzes(root);
  enhanceSolutions(root);
  enhanceChallenges(root);
  enhanceCheckpoints(root);
  enhanceLessonFoot(root);
  enhanceLessonNav(root);
}

export async function renderAll(onProgress) {
  const units = course().units;
  for (let i = 0; i < units.length; i++) {
    if (onProgress) onProgress(i + 1, units.length);
    await renderUnit(units[i]).catch(() => {});
  }
}

/* تحميل الوحدات القريبة من الشاشة */
export function lazyCheck() {
  const h = window.innerHeight;
  course().units.forEach(u => {
    if (u.loaded || pending.has(u.id)) return;
    const r = u.sec.getBoundingClientRect();
    if (r.top < h + 1200 && r.bottom > -1200) renderUnit(u).catch(() => {});
  });
}

export function watchViewport() {
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const u = course().units.find(x => x.sec === e.target);
        if (u && !u.loaded) renderUnit(u).catch(() => {});
      });
    }, { rootMargin: "1200px 0px 1200px 0px" });
    course().units.forEach(u => io.observe(u.sec));
  }
  window.addEventListener("resize", lazyCheck);
}

/* بعد ما وحدة تترسم، بنجهّز اللي بعدها واللي قبلها في الخلفية */
function prefetchNeighbours(u) {
  const units = course().units;
  const i = units.indexOf(u);
  [units[i + 1], units[i - 1]].forEach(n => prefetchUnit(n));
}

/* الفهرس بيستخدمها لما الطالب يمرّ على رابط درس */
export function prefetchFor(id) {
  const unit = course().unitFor(id);
  if (unit && !unit.loaded) prefetchUnit(unit);
}

export const isLoaded = u => u.loaded;
