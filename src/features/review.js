/* ============================================================================
   features/review — وضع المراجعة: بيعيد الأسئلة اللي الطالب غلط فيها بس
   لما يجاوب صح، السؤال بيتشال من قائمة المراجعة.
   ============================================================================ */
import { $, $$, el, escHTML } from "../core/dom.js";
import { state, save } from "../core/state.js";
import { course } from "../data/course.js";
import { openModal } from "../ui/modal.js";
import { renderUnit } from "./render.js";
import { markLabel } from "./quiz.js";

export async function startReview(wrong) {
  const box = el("div", "review");
  const items = [];
  const model = course();

  for (const w of wrong) {
    const lessonId = w.key.split(":")[0];
    const quizIndex = parseInt(w.key.split(":")[1], 10);
    const info = model.lesson(lessonId);
    if (!info) continue;
    if (!info.unit.loaded) {
      try { await renderUnit(info.unit, { noAdjust: true }); } catch (e) { continue; }
    }
    const article = document.getElementById(lessonId);
    if (!article) continue;
    const quiz = $$(".quiz", article)[quizIndex];
    if (!quiz) continue;
    const question = $$(".q", quiz)[w.index];
    if (!question) continue;

    const clone = question.cloneNode(true);
    $$(".mark, .sr-only, .q-feedback", clone).forEach(x => x.remove());
    $$("label", clone).forEach(l => l.classList.remove("ok", "bad"));
    $$("input", clone).forEach((inp, j) => {
      inp.checked = false;
      inp.name = "review-" + items.length + "-" + w.index;
      inp.id = inp.name + "-" + j;
      inp.value = j;
      const lbl = inp.closest("label");
      if (lbl) lbl.setAttribute("for", inp.id);
    });

    const item = el("div", "review-item");
    item.appendChild(el("p", "review-src", 'من درس: <a href="#' + lessonId + '" class="dash-link">' + escHTML(info.title) + "</a>"));
    item.appendChild(clone);
    box.appendChild(item);
    items.push({ w, el: clone });
  }

  if (!items.length) {
    box.innerHTML = "<p>مفيش أسئلة جاهزة للمراجعة.</p>";
    openModal("وضع المراجعة", box);
    return;
  }

  const bar = el("div", "review-bar");
  const checkBtn = el("button", "dash-btn primary", "صحّح المراجعة");
  checkBtn.type = "button";
  bar.appendChild(checkBtn);
  const result = el("p", "review-res");
  result.setAttribute("role", "status");
  box.appendChild(bar);
  box.appendChild(result);

  checkBtn.addEventListener("click", () => {
    let right = 0, answered = 0;
    items.forEach(item => {
      $$(".mark, .sr-only, .q-feedback", item.el).forEach(x => x.remove());
      $$("label", item.el).forEach(l => l.classList.remove("ok", "bad"));

      const correct = parseInt(item.el.dataset.a, 10);
      const labels = $$("label", item.el);
      const picked = $("input:checked", item.el);
      if (labels[correct]) { labels[correct].classList.add("ok"); markLabel(labels[correct], "✓", "الإجابة الصحيحة"); }
      if (!picked) return;

      answered++;
      const pickedIdx = parseInt(picked.value, 10);
      const fb = el("p", "q-feedback");
      if (pickedIdx === correct) {
        right++;
        fb.classList.add("fb-ok");
        fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✓</span><strong>صح كده.</strong> شيلناه من قائمة المراجعة.';
        const st = state.quiz[item.w.key];
        if (st && st.wrong) {
          st.wrong = st.wrong.filter(x => x !== item.w.index);
          if (typeof st.score === "number") st.score = Math.min(st.total || 0, st.score + 1);
          save("quiz");
        }
      } else {
        fb.classList.add("fb-bad");
        if (labels[pickedIdx]) { labels[pickedIdx].classList.add("bad"); markLabel(labels[pickedIdx], "✗", "إجابتك، وهي خطأ"); }
        fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✗</span><strong>لسه غلط.</strong> افتح الدرس واقرا القسم اللي فيه الإجابة، وبعدين جرّب تاني.';
      }
      item.el.appendChild(fb);
    });

    result.textContent = answered
      ? "صح " + right + " من " + answered + " — اللي لسه غلط بيفضل في المراجعة."
      : "جاوب على سؤال واحد على الأقل 🙂";
  });

  openModal("وضع المراجعة — الأسئلة اللي غلطت فيها", box);
}
