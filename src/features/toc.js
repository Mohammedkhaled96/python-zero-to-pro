/* ============================================================================
   features/toc — الفهرس الجانبي + شريط التقدّم + البحث
   بيتبني من المانيفست (من غير ما أي وحدة تتحمّل).
   ============================================================================ */
import { $, $$, el, setText, escHTML } from "../core/dom.js";
import { on } from "../core/bus.js";
import { state } from "../core/state.js";
import { course } from "../data/course.js";
import { loadSearchIndex } from "../data/search.js";
import { prefetchFor } from "./render.js";

let tocEl = null;

export function buildToc() {
  tocEl = $("#toc");
  let html = "";
  course().units.forEach(u => {
    let items = "";
    u.lessons.forEach(l => {
      items += '<li data-id="' + l.id + '"><a href="#' + l.id + '">' +
        (l.project ? '<span class="pj">◆ </span>' : "") +
        '<span class="lt">' + escHTML(l.title) + "</span>" +
        '<span class="mins">' + l.minutes + "د</span></a></li>";
    });
    html += '<div class="unit-block" data-unit="' + u.id + '">' +
      '<button class="unit-btn" type="button" aria-expanded="false"><span class="caret">▾</span>' +
      '<span class="num">' + escHTML(u.num) + "</span>" +
      '<span class="ttl">' + escHTML(u.title) + "</span>" +
      '<span class="uprog"></span></button>' +
      "<ul>" + items + "</ul></div>";
  });
  tocEl.innerHTML = html;

  $$(".unit-btn", tocEl).forEach(btn => {
    btn.addEventListener("click", () => {
      const open = btn.parentNode.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* أول ما الطالب يقرّب من رابط درس، بنجهّز وحدته في الخلفية */
  ["pointerover", "focusin", "touchstart"].forEach(ev => {
    tocEl.addEventListener(ev, e => {
      const a = e.target.closest && e.target.closest("li[data-id] a");
      if (a) prefetchFor(a.getAttribute("href").slice(1));
    }, { passive: true });
  });

  refreshProgress();
  initSearch();

  on("progress:changed", refreshProgress);
  on("lesson:current", markCurrent);
}

export function openUnitBlock(unitId) {
  const blk = $('.unit-block[data-unit="' + unitId + '"]', tocEl);
  if (blk && !blk.classList.contains("open")) {
    blk.classList.add("open");
    $(".unit-btn", blk).setAttribute("aria-expanded", "true");
  }
}

function markCurrent(id) {
  $$("a.active", tocEl).forEach(a => a.classList.remove("active"));
  if (!id) return;
  const info = course().lesson(id);
  const a = $('li[data-id="' + id + '"] a', tocEl);
  if (a) {
    a.classList.add("active");
    const sidebar = $("#sidebar");
    if (sidebar && !sidebar.classList.contains("open")) {
      const r = a.getBoundingClientRect(), tr = tocEl.getBoundingClientRect();
      if (r.top < tr.top || r.bottom > tr.bottom) a.scrollIntoView({ block: "nearest" });
    }
  }
  if (info) openUnitBlock(info.unit.id);
}

export function refreshProgress() {
  let done = 0;
  course().units.forEach(u => {
    let unitDone = 0;
    u.lessons.forEach(l => {
      const on = !!state.done[l.id];
      if (on) { unitDone++; done++; }
      const a = $('li[data-id="' + l.id + '"] a', tocEl);
      if (a) a.classList.toggle("done", on);
    });
    setText($('.unit-block[data-unit="' + u.id + '"] .uprog', tocEl), unitDone ? unitDone + "/" + u.lessons.length : "");
  });

  const total = course().lessons.length;
  setText($("#progress-text"), "تقدّمك: " + done + " من " + total + " (دروس ومشاريع وتمارين)");
  const width = (total ? (done / total * 100) : 0) + "%";
  const fill = $("#progress-fill");
  if (fill && fill.style.width !== width) fill.style.width = width;
}

/* ---------- البحث: العناوين فورًا، والمحتوى من فهرس بيتحمّل عند أول بحث ---------- */
function initSearch() {
  const input = $("#search");
  const info = el("div", "search-info");
  info.setAttribute("role", "status");
  input.parentNode.insertBefore(info, input.nextSibling);

  let index = null;
  let timer = null;

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let hits = 0;
    course().units.forEach(u => {
      const blk = $('.unit-block[data-unit="' + u.id + '"]', tocEl);
      const unitHit = q && u.title.toLowerCase().indexOf(q) > -1;
      let any = false;
      u.lessons.forEach(l => {
        const li = $('li[data-id="' + l.id + '"]', tocEl);
        const titleHit = !q || l.title.toLowerCase().indexOf(q) > -1;
        const bodyHit = !titleHit && q.length >= 3 && index && (index[l.id] || "").indexOf(q) > -1;
        const show = !q || unitHit || titleHit || bodyHit;
        li.style.display = show ? "" : "none";
        li.classList.toggle("body-hit", !!bodyHit);
        if (show) { any = true; if (q) hits++; }
      });
      blk.style.display = any ? "" : "none";
      if (q && any) blk.classList.add("open");
    });
    info.textContent = q
      ? (hits ? hits + " درس فيه «" + input.value.trim() + "»" + (index ? " (📄 = الكلمة في المحتوى)" : "") : "مفيش نتايج")
      : "";
  };

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const q = input.value.trim();
      if (q.length >= 3 && !index) {
        info.textContent = "⏳ بنجهّز البحث في المحتوى…";
        index = await loadSearchIndex().catch(() => ({}));
      }
      apply();
    }, 160);
  });
}
