/* ============================================================================
   features/editor — محرّر كود بسيط (Tab بيزوّد مسافات، Enter بيحافظ على الإزاحة)
   ============================================================================ */
import { el } from "../core/dom.js";

export function makeEditor(value, label) {
  const ta = el("textarea", "code-editor");
  ta.value = value;
  ta.spellcheck = false;
  ta.setAttribute("dir", "ltr");
  ta.setAttribute("aria-label", label || "محرّر الكود");
  ta.setAttribute("autocapitalize", "off");
  ta.setAttribute("autocomplete", "off");

  const fit = () => {
    ta.style.height = "auto";
    ta.style.height = Math.min(700, ta.scrollHeight + 4) + "px";
  };

  ta.addEventListener("input", fit);
  ta.addEventListener("keydown", e => {
    const start = ta.selectionStart, end = ta.selectionEnd, v = ta.value;
    if (e.key === "Tab" && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      if (e.shiftKey) {
        if (v.substr(lineStart, 4) === "    ") {
          ta.value = v.slice(0, lineStart) + v.slice(lineStart + 4);
          ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - 4);
        }
      } else {
        ta.value = v.slice(0, start) + "    " + v.slice(end);
        ta.selectionStart = ta.selectionEnd = start + 4;
      }
      fit();
    } else if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const line = v.slice(lineStart, start);
      let indent = (line.match(/^\s*/) || [""])[0];
      if (/:\s*$/.test(line)) indent += "    ";
      e.preventDefault();
      ta.value = v.slice(0, start) + "\n" + indent + v.slice(end);
      ta.selectionStart = ta.selectionEnd = start + 1 + indent.length;
      fit();
    }
  });

  ta.fit = fit;
  setTimeout(fit, 0);
  return ta;
}

/* نسخ مع بديل لو المتصفّح رافض clipboard API */
export function copyText(text) {
  const legacy = () => new Promise((res, rej) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    ok ? res() : rej(new Error("copy failed"));
  });
  if (navigator.clipboard && window.isSecureContext)
    return navigator.clipboard.writeText(text).catch(legacy);
  return legacy();
}
