/* ============================================================================
   features/lines-table — جدول «اشرح الكود سطرًا بسطر»
   بيتبني أول ما الطالب يفتحه بس (مش مع كل بلوك كود).
   ============================================================================ */
import { $, el } from "../core/dom.js";
import { highlightPython } from "../ui/highlight.js";

export function buildLinesTable(lines, notes) {
  let rows = "", keys = 0;
  lines.forEach((src, i) => {
    const isBlank = src.trim() === "";
    const note = isBlank ? "سطر فاضي — للفصل البصري فقط"
      : (notes[i] && String(notes[i]).trim() ? notes[i] : "—");
    const isKey = !isBlank && /<b>/.test(note);
    if (isKey) keys++;
    rows += '<tr class="' + (isBlank ? "blank" : "") + (isKey ? " key" : "") + '">' +
      '<td class="ln">' + (isKey ? '<span class="star" aria-label="سطر مفتاحي">★</span>' : "") + (i + 1) + "</td>" +
      '<td class="src">' + (isBlank ? "" : highlightPython(src)) + "</td>" +
      '<td class="exp">' + note + "</td></tr>";
  });

  const wrap = el("div", "tbl-wrap");
  const tools = keys
    ? '<div class="lines-tools"><button type="button" class="key-only" aria-pressed="false">★ الأسطر المفتاحية بس (' + keys + ")</button></div>"
    : "";
  wrap.innerHTML = tools + '<table class="lines-tbl"><tr><th>#</th><th>السطر</th><th>الشرح</th></tr>' + rows + "</table>";

  const keyBtn = $(".key-only", wrap);
  if (keyBtn) keyBtn.addEventListener("click", () => {
    const on = wrap.classList.toggle("keys-only");
    keyBtn.setAttribute("aria-pressed", on ? "true" : "false");
    keyBtn.textContent = on ? "☰ اعرض كل الأسطر" : "★ الأسطر المفتاحية بس (" + keys + ")";
  });
  return wrap;
}

export function buildLinesFooter(details) {
  const foot = el("div", "lines-foot");
  const btn = el("button", "lines-close", "✕ إغلاق الشرح");
  btn.type = "button";
  btn.addEventListener("click", () => {
    details.open = false;
    if (details.getBoundingClientRect().top < 0) details.scrollIntoView({ block: "center" });
  });
  foot.appendChild(btn);
  return foot;
}
