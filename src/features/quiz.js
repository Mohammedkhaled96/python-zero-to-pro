/* ============================================================================
   features/quiz — الاختبارات القصيرة
   بتحفظ إجابات الطالب ونتيجته، وبتسجّل أرقام الأسئلة الغلط لوضع المراجعة.
   ============================================================================ */
import { $, $$, el, eachSafe } from "../core/dom.js";
import { state, save } from "../core/state.js";

export function optionHTML(label) {
  const clone = label.cloneNode(true);
  $$("input, .mark, .sr-only", clone).forEach(x => x.remove());
  return clone.innerHTML.trim();
}

export function markLabel(label, symbol, srText) {
  const mark = el("span", "mark");
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = symbol;
  label.appendChild(mark);
  const sr = el("span", "sr-only");
  sr.textContent = " — " + srText;
  label.appendChild(sr);
}

export function enhanceQuizzes(root) {
  eachSafe($$(".lesson", root), lesson => {
    $$(".quiz", lesson).forEach((quiz, qn) => {
      const qkey = lesson.id + ":" + qn;
      const questions = $$(".q", quiz);
      const saved = state.quiz[qkey] || { a: {} };

      questions.forEach((q, i) => {
        const qt = $(".qt", q);
        if (qt) {
          qt.id = "qt-" + qkey.replace(/[^\w-]/g, "_") + "-" + i;
          q.setAttribute("role", "group");
          q.setAttribute("aria-labelledby", qt.id);
        }
        $$('input[type="radio"]', q).forEach((inp, j) => {
          inp.name = "quiz-" + qkey + "-" + i;
          inp.value = j;
          inp.id = "opt-" + qkey.replace(/[^\w-]/g, "_") + "-" + i + "-" + j;
          const lbl = inp.closest("label");
          if (lbl) lbl.setAttribute("for", inp.id);
          if (saved.a[i] === j) inp.checked = true;
          inp.addEventListener("change", () => {
            const s = state.quiz[qkey] || { a: {} };
            s.a[i] = j;
            state.quiz[qkey] = s;
            save("quiz");
          });
        });
      });

      const bar = el("div", "quiz-bar");
      const checkBtn = el("button", "quiz-check", "صحّح إجاباتي");
      checkBtn.type = "button";
      const againBtn = el("button", "quiz-again", "↺ أعد الاختبار");
      againBtn.type = "button";
      againBtn.hidden = true;
      bar.appendChild(checkBtn);
      bar.appendChild(againBtn);

      const result = el("div", "quiz-result");
      result.setAttribute("role", "status");
      result.setAttribute("aria-live", "polite");
      quiz.appendChild(bar);
      quiz.appendChild(result);

      function clearMarks() {
        questions.forEach(q => {
          $$("label", q).forEach(l => {
            l.classList.remove("ok", "bad");
            $$(".mark, .sr-only", l).forEach(x => x.remove());
          });
          const old = $(".q-feedback", q);
          if (old) old.remove();
        });
      }

      function grade() {
        clearMarks();
        const answered = questions.filter(q => $("input:checked", q)).length;
        if (answered === 0) {
          result.textContent = "جاوب على الأسئلة الأول 🙂";
          result.style.color = "var(--tx2)";
          return;
        }
        let score = 0, wrong = 0, blank = 0;
        const wrongIdx = [];
        questions.forEach((q, qi) => {
          const correct = parseInt(q.dataset.a, 10);
          const labels = $$("label", q);
          const correctLabel = labels[correct];
          const correctHTML = correctLabel ? optionHTML(correctLabel) : "—";
          const picked = $("input:checked", q);
          if (correctLabel) { correctLabel.classList.add("ok"); markLabel(correctLabel, "✓", "الإجابة الصحيحة"); }

          const fb = el("p", "q-feedback");
          if (!picked) {
            blank++;
            fb.classList.add("fb-none");
            fb.innerHTML = '<span class="fb-icon" aria-hidden="true">—</span><strong>لم تُجب على هذا السؤال.</strong> الإجابة الصحيحة: <span class="ans">' + correctHTML + "</span>";
          } else if (parseInt(picked.value, 10) === correct) {
            score++;
            fb.classList.add("fb-ok");
            fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✓</span><strong>إجابة صحيحة.</strong> الإجابة هي: <span class="ans">' + correctHTML + "</span>";
          } else {
            wrong++;
            wrongIdx.push(qi);
            fb.classList.add("fb-bad");
            const wl = labels[parseInt(picked.value, 10)];
            let wrongHTML = "—";
            if (wl) { wrongHTML = optionHTML(wl); wl.classList.add("bad"); markLabel(wl, "✗", "إجابتك، وهي خطأ"); }
            fb.innerHTML = '<span class="fb-icon" aria-hidden="true">✗</span><strong>إجابة خاطئة.</strong> إجابتك: <span class="ans">' +
              wrongHTML + '</span> — الإجابة الصحيحة: <span class="ans">' + correctHTML + "</span>";
          }
          q.appendChild(fb);
        });

        const total = questions.length;
        const parts = ["نتيجتك: " + score + " من " + total];
        if (wrong) parts.push(wrong + " إجابة خاطئة");
        if (blank) parts.push(blank + " سؤال بدون إجابة");
        parts.push(score === total ? "🎉 ممتاز، كل الإجابات صحيحة" : "الإجابة الصحيحة مكتوبة تحت كل سؤال ومعلّمة بعلامة ✓");
        result.textContent = parts.join(" — ");
        result.style.color = score === total ? "var(--ok)" : "var(--warn)";
        againBtn.hidden = false;

        const s = state.quiz[qkey] || { a: {} };
        s.graded = true; s.score = score; s.total = total; s.t = Date.now(); s.wrong = wrongIdx;
        state.quiz[qkey] = s;
        save("quiz");
      }

      checkBtn.addEventListener("click", grade);
      againBtn.addEventListener("click", () => {
        clearMarks();
        $$("input:checked", quiz).forEach(i => { i.checked = false; });
        result.textContent = "";
        againBtn.hidden = true;
        delete state.quiz[qkey];
        save("quiz");
        const first = $("input", quiz);
        if (first) first.focus();
      });

      if (saved.graded) grade();
    });
  });
}

/* «حاولت الأول؟» قبل ما يفتح الحل */
export function enhanceSolutions(root) {
  $$(".ex details.sol", root).forEach(details => {
    if (details.closest(".challenge")) return;
    const summary = $("summary", details);
    let hint = null;
    summary.addEventListener("click", e => {
      if (details.open || details.dataset.tried) return;
      e.preventDefault();
      details.dataset.tried = "1";
      hint = el("p", "sol-hint", "🤔 حاولت تحلّه بنفسك الأول؟ المحاولة (حتى لو غلط) هي اللي بتعلّم. اضغط «شوف الحل» تاني لو عايز تكمّل.");
      hint.setAttribute("role", "status");
      details.parentNode.insertBefore(hint, details);
    });
    details.addEventListener("toggle", () => {
      if (details.open && hint) { hint.remove(); hint = null; }
    });
  });
}
