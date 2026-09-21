/* ============================================================================
   features/code-blocks — تجهيز كل بلوك كود في الدرس
     • رأس فيه اسم الملف وزرار نسخ
     • تلوين الكود
     • جدول الشرح سطرًا بسطر (من شرح الوحدة)
     • لوحة التشغيل (لو البلوك قابل للتشغيل)
   ============================================================================ */
import { $, $$, el, escHTML, eachSafe } from "../core/dom.js";
import { highlightPython } from "../ui/highlight.js";
import { buildLinesTable, buildLinesFooter } from "./lines-table.js";
import { attachRunner } from "./run-panel.js";
import { copyText } from "./editor.js";

export function enhanceCode(root, notes = {}) {
  eachSafe($$(".lesson", root), lesson => {
    $$(".code", lesson).forEach((box, idx) => {
      const pre = $("pre", box);
      if (!pre || pre.dataset.raw !== undefined) return;

      const raw = pre.textContent.replace(/^\n/, "").replace(/\s+$/, "");
      pre.dataset.raw = raw;
      pre.innerHTML = highlightPython(raw);

      const head = el("div", "code-head", '<span class="fname">' + escHTML(box.dataset.file || "python") + "</span>");
      const copy = el("button", "copy-btn", "نسخ");
      copy.type = "button";
      copy.addEventListener("click", () => {
        const ed = $(".code-editor", box);
        const text = ed ? ed.value : raw;
        copyText(text).then(() => {
          copy.textContent = "تم ✓";
          copy.classList.add("done");
          setTimeout(() => { copy.textContent = "نسخ"; copy.classList.remove("done"); }, 1600);
        }, () => {
          copy.textContent = "انسخ يدويًا (Ctrl+C)";
          setTimeout(() => { copy.textContent = "نسخ"; }, 2500);
          const r = document.createRange();
          r.selectNodeContents(ed || pre);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
        });
      });
      head.appendChild(copy);
      box.insertBefore(head, pre);

      const key = lesson.id + "." + (idx + 1);
      const lineNotes = notes[key];
      if (lineNotes) {
        const lines = raw.split("\n");
        const details = el("details", "lines",
          '<summary><span class="lbl-open">🔍 اشرح الكود سطرًا بسطر</span>' +
          '<span class="lbl-close">✕ إغلاق الشرح</span>' +
          '<span class="cnt">' + lines.length + " سطر</span></summary>");
        let built = false;
        details.addEventListener("toggle", () => {
          if (details.open && !built) {
            built = true;
            details.appendChild(buildLinesTable(lines, lineNotes));
            details.appendChild(buildLinesFooter(details));
          }
        });
        let anchor = box;
        while (anchor.nextElementSibling && anchor.nextElementSibling.classList.contains("out")) anchor = anchor.nextElementSibling;
        anchor.parentNode.insertBefore(details, anchor.nextSibling);
      }

      if (!box.closest(".challenge")) attachRunner(box, pre, lesson.id, key);
    });
  });
}
