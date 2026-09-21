/* ============================================================================
   features/lesson-extras — إضافات على كل درس
     • محتويات الدرس (فهرس داخلي)
     • وصف نصّي للرسومات (إتاحة لقارئ الشاشة)
     • نقاط التفتيش في آخر الوحدة
     • ذيل الدرس: «علّم كمكتمل» + رأي الطالب
     • روابط الدرس التالي والسابق
   ============================================================================ */
import { $, $$, el, escHTML, eachSafe } from "../core/dom.js";
import { state, save } from "../core/state.js";
import { emit } from "../core/bus.js";
import { course } from "../data/course.js";

export function enhanceMiniToc(root) {
  eachSafe($$(".lesson", root), lesson => {
    const heads = $$(":scope > h4", lesson);
    if (heads.length < 2) return;
    let items = "";
    heads.forEach((h, i) => {
      if (!h.id) h.id = lesson.id + "-p" + (i + 1);
      items += '<li><a href="#' + h.id + '">' + escHTML(h.textContent) + "</a></li>";
    });
    const box = el("div", "mini-toc", '<div class="mt-title">📌 محتويات هذا الدرس</div><ol>' + items + "</ol>");
    const anchor = $(".goal", lesson) || $("h3", lesson);
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
  });
}

export function enhanceDiagrams(root) {
  eachSafe($$(".diagram", root), d => {
    const pre = $("pre", d), cap = $(".cap", d);
    if (!pre) return;
    pre.setAttribute("aria-hidden", "true");   /* رسم بحروف — قارئ الشاشة بيقراه غلط */
    if (cap) {
      d.setAttribute("role", "img");
      d.setAttribute("aria-label", "رسم توضيحي: " + cap.textContent.trim());
    }
  });
}

export function enhanceCheckpoints(root) {
  eachSafe($$(".checkpoint", root), cp => {
    const key = cp.dataset.unit;
    const items = $$("li", cp);
    const saved = state.cp[key] || [];
    const prog = el("p", "cp-prog");
    prog.setAttribute("role", "status");

    items.forEach((li, i) => {
      const id = "cp-" + key + "-" + i;
      li.innerHTML = '<label for="' + id + '"><input type="checkbox" id="' + id + '"> <span>' + li.innerHTML + "</span></label>";
      const box = $("input", li);
      box.checked = saved.indexOf(i) > -1;
      box.addEventListener("change", () => {
        let list = (state.cp[key] || []).filter(x => x !== i);
        if (box.checked) list.push(i);
        state.cp[key] = list;
        save("cp");
        paint();
      });
    });

    function paint() {
      const n = (state.cp[key] || []).length;
      prog.textContent = n === items.length
        ? "🎉 " + n + "/" + items.length + " — إنت جاهز للوحدة الجاية!"
        : n + "/" + items.length + " — اللي مش متأكّد منه، ارجع لدرسه قبل ما تكمّل.";
      cp.classList.toggle("complete", n === items.length);
    }
    cp.appendChild(prog);
    paint();
  });
}

export function enhanceLessonFoot(root) {
  eachSafe($$(".lesson", root), lessonEl => {
    const info = course().lesson(lessonEl.id);
    const h3 = $("h3", lessonEl);
    if (info && h3 && !$(".mins", h3)) {
      const mins = el("span", "mins", "⏱ " + info.minutes + " د");
      mins.title = "الوقت التقريبي للدرس ده بالتمارين";
      h3.appendChild(mins);
    }

    const foot = el("div", "lesson-foot");
    const doneBtn = el("button", "done-btn");
    doneBtn.type = "button";
    const paintDone = () => {
      const on = !!state.done[lessonEl.id];
      doneBtn.classList.toggle("on", on);
      doneBtn.textContent = on ? "✓ خلّصت الدرس ده" : "علّم كمكتمل";
      doneBtn.setAttribute("aria-pressed", on ? "true" : "false");
    };
    doneBtn.addEventListener("click", () => {
      if (state.done[lessonEl.id]) delete state.done[lessonEl.id];
      else state.done[lessonEl.id] = Date.now();
      save("done");
      paintDone();
      emit("progress:changed");
    });
    paintDone();
    foot.appendChild(doneBtn);

    /* رأي الطالب في الدرس */
    const fb = el("div", "fb");
    const saved = state.fb[lessonEl.id] || {};
    fb.innerHTML =
      '<span class="fb-q">الدرس كان واضح؟</span>' +
      '<button type="button" class="fb-btn" data-v="1" aria-pressed="false">👍 آه</button>' +
      '<button type="button" class="fb-btn" data-v="-1" aria-pressed="false">👎 مش أوي</button>' +
      '<div class="fb-more" hidden><label>إيه اللي محتاج توضيح أكتر؟ <textarea rows="2" dir="auto"></textarea></label>' +
      '<button type="button" class="fb-save">حفظ الملاحظة</button><span class="fb-ok" role="status"></span></div>';

    const more = $(".fb-more", fb), note = $("textarea", fb), okMsg = $(".fb-ok", fb);
    if (saved.note) note.value = saved.note;
    const paintFb = () => {
      const cur = (state.fb[lessonEl.id] || {}).v;
      $$(".fb-btn", fb).forEach(b => {
        const on = String(cur) === b.dataset.v;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      more.hidden = cur !== -1;
    };
    $$(".fb-btn", fb).forEach(b => {
      b.addEventListener("click", () => {
        const s = state.fb[lessonEl.id] || {};
        s.v = parseInt(b.dataset.v, 10);
        s.t = Date.now();
        state.fb[lessonEl.id] = s;
        save("fb");
        paintFb();
        if (s.v === -1) note.focus();
      });
    });
    $(".fb-save", fb).addEventListener("click", () => {
      const s = state.fb[lessonEl.id] || {};
      s.note = note.value.trim();
      s.t = Date.now();
      state.fb[lessonEl.id] = s;
      save("fb");
      okMsg.textContent = "✓ اتحفظت — شكرًا!";
    });
    paintFb();
    foot.appendChild(fb);
    lessonEl.appendChild(foot);
  });
}

export function enhanceLessonNav(root) {
  eachSafe($$(".lesson", root), lessonEl => {
    const { prev, next } = course().neighbours(lessonEl.id);
    if (!prev && !next) return;
    const nav = el("div", "lesson-nav");
    if (prev) nav.innerHTML += '<a class="lnav prev" href="#' + prev.id + '">◀ السابق: ' + escHTML(prev.title) + "</a>";
    if (next) nav.innerHTML += '<a class="lnav next" href="#' + next.id + '">التالي: ' + escHTML(next.title) + " ▶</a>";
    lessonEl.appendChild(nav);
  });
}
