/* ============================================================================
   features/dashboard — لوحة تقدّم الطالب
   بتقرا من core/state بس وبتحسب: الإنجاز، الوقت، نتايج الاختبارات،
   التحدّيات، والدروس اللي تستاهل رجعة.
   ============================================================================ */
import { el, escHTML } from "../core/dom.js";
import { state } from "../core/state.js";
import { course } from "../data/course.js";
import { openModal, closeModal } from "../ui/modal.js";
import { startReview } from "./review.js";

export function quizStats() {
  let answered = 0, score = 0;
  const wrong = [];
  Object.keys(state.quiz).forEach(key => {
    const s = state.quiz[key];
    if (!s || !s.graded) return;
    answered += s.total || 0;
    score += s.score || 0;
    (s.wrong || []).forEach(index => wrong.push({ key, index }));
  });
  return { answered, score, wrong };
}

function unitStats(u) {
  let done = 0, secs = 0, qTotal = 0, qScore = 0;
  u.lessons.forEach(l => {
    if (state.done[l.id]) done++;
    secs += state.time[l.id] || 0;
    Object.keys(state.quiz).forEach(key => {
      if (key.indexOf(l.id + ":") !== 0) return;
      const s = state.quiz[key];
      if (s && s.graded) { qTotal += s.total || 0; qScore += s.score || 0; }
    });
  });
  /* عدد التحدّيات من المانيفست، والمحلول من حالة الطالب */
  const chAll = u.challenges || 0;
  let chDone = 0;
  Object.keys(state.ch).forEach(id => {
    if (state.ch[id] && state.ch[id].solved && id.indexOf("u" + u.num + "-") === 0) chDone++;
  });
  return { done, total: u.lessons.length, secs, qTotal, qScore, chAll, chDone };
}

export function fmtMins(secs) {
  const m = Math.round(secs / 60);
  return m < 60 ? m + " د" : Math.floor(m / 60) + " س " + (m % 60) + " د";
}

export function buildDashboard() {
  const wrap = el("div", "dash");
  const model = course();
  const q = quizStats();

  let doneCount = 0, timeAll = 0;
  model.lessons.forEach(l => {
    if (state.done[l.id]) doneCount++;
    timeAll += state.time[l.id] || 0;
  });
  let chAll = 0, chDone = 0;
  model.units.forEach(u => { const s = unitStats(u); chAll += s.chAll; chDone += s.chDone; });

  const pct = model.lessons.length ? Math.round(doneCount / model.lessons.length * 100) : 0;
  const qPct = q.answered ? Math.round(q.score / q.answered * 100) : 0;

  wrap.innerHTML =
    '<div class="dash-cards">' +
      '<div class="dash-card"><b>' + pct + "%</b><span>" + doneCount + " من " + model.lessons.length + " درس مكتمل</span></div>" +
      '<div class="dash-card"><b>' + fmtMins(timeAll) + "</b><span>وقت مذاكرة فعلي</span></div>" +
      '<div class="dash-card"><b>' + (q.answered ? qPct + "%" : "—") + "</b><span>" +
        (q.answered ? q.score + " من " + q.answered + " سؤال صح" : "لسه مجاوبتش اختبارات") + "</span></div>" +
      '<div class="dash-card"><b>' + chDone + " / " + chAll + "</b><span>تحدّي محلول</span></div>" +
    "</div>";

  /* المراجعة */
  const reviewBox = el("div", "dash-review");
  if (q.wrong.length) {
    reviewBox.innerHTML = "<p>عندك <strong>" + q.wrong.length + "</strong> سؤال جاوبت عليهم غلط. المراجعة بتعيدهم عليك لوحدهم.</p>";
    const btn = el("button", "dash-btn primary", "🔁 ابدأ وضع المراجعة");
    btn.type = "button";
    btn.addEventListener("click", () => startReview(q.wrong));
    reviewBox.appendChild(btn);
  } else {
    reviewBox.innerHTML = "<p>مفيش أسئلة غلط محفوظة — يا إما جاوبت كله صح، يا إما لسه ما بدأتش الاختبارات. 🙂</p>";
  }
  wrap.appendChild(reviewBox);

  /* جدول الوحدات */
  let rows = "";
  model.units.forEach(u => {
    const s = unitStats(u);
    const p = s.total ? Math.round(s.done / s.total * 100) : 0;
    rows += "<tr>" +
      '<td><a href="#' + u.id + '" class="dash-link">' + escHTML(u.num + ". " + u.title) + "</a></td>" +
      '<td><div class="dash-bar"><i style="width:' + p + '%"></i></div><span class="dash-num">' + s.done + "/" + s.total + "</span></td>" +
      "<td>" + (s.secs ? fmtMins(s.secs) : "—") + "</td>" +
      "<td>" + (s.qTotal ? Math.round(s.qScore / s.qTotal * 100) + "%" : "—") + "</td>" +
      "<td>" + (s.chAll ? s.chDone + "/" + s.chAll : "—") + "</td></tr>";
  });
  const table = el("div", "tbl-wrap");
  table.innerHTML = '<table class="dash-tbl"><tr><th>الوحدة</th><th>التقدّم</th><th>الوقت</th><th>الاختبارات</th><th>التحدّيات</th></tr>' + rows + "</table>";
  wrap.appendChild(table);

  /* دروس تستاهل رجعة */
  const weak = [];
  Object.keys(state.fb).forEach(id => {
    if ((state.fb[id] || {}).v === -1 && model.lesson(id)) weak.push({ id, why: "قلت إنه مش واضح" });
  });
  const byLesson = {};
  q.wrong.forEach(w => {
    const id = w.key.split(":")[0];
    byLesson[id] = (byLesson[id] || 0) + 1;
  });
  Object.keys(byLesson).forEach(id => {
    if (model.lesson(id)) weak.push({ id, why: byLesson[id] + " سؤال غلط" });
  });
  if (weak.length) {
    let list = "";
    weak.slice(0, 8).forEach(w => {
      list += '<li><a href="#' + w.id + '" class="dash-link">' + escHTML(model.lesson(w.id).title) +
        '</a> <span class="dash-why">' + escHTML(w.why) + "</span></li>";
    });
    wrap.appendChild(el("div", "dash-weak", "<h4>دروس تستاهل رجعة</h4><ul>" + list + "</ul>"));
  }

  wrap.addEventListener("click", e => {
    if (e.target.closest(".dash-link")) closeModal();
  });
  return wrap;
}

export function openDashboard() {
  openModal("لوحة تقدّمي", buildDashboard());
}
