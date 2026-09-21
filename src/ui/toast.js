/* ============================================================================
   ui/toast — إشعار صغير أسفل الشاشة (مع أزرار اختيارية)
   ============================================================================ */
import { el } from "../core/dom.js";

export function toast(html, actions = [], ms = 0) {
  const box = el("div", "toast", '<div class="toast-body">' + html + "</div>");
  box.setAttribute("role", "status");
  const row = el("div", "toast-actions");
  actions.forEach(action => {
    const b = el("button", action.primary ? "primary" : "", action.label);
    b.type = "button";
    b.addEventListener("click", () => { action.run(); box.remove(); });
    row.appendChild(b);
  });
  const close = el("button", "toast-x", "✕");
  close.type = "button";
  close.setAttribute("aria-label", "إغلاق");
  close.addEventListener("click", () => box.remove());
  row.appendChild(close);
  box.appendChild(row);
  document.body.appendChild(box);
  if (ms) setTimeout(() => { if (box.parentNode) box.remove(); }, ms);
  return box;
}

export function closeToasts() {
  document.querySelectorAll(".toast").forEach(t => t.remove());
}
