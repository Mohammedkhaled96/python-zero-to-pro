/* ============================================================================
   ui/modal — نافذة عامة (لوحة التقدّم · المراجعة · المساعدة)
   ============================================================================ */
import { el, escHTML } from "../core/dom.js";

let current = null;

export function isOpen() { return !!current; }

export function closeModal() {
  if (!current) return;
  const { back, lastFocus } = current;
  current.box.remove();
  if (back) back.remove();
  current = null;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

export function openModal(title, node) {
  closeModal();
  const back = el("div", "modal-back");
  const box = el("div", "modal");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", title);

  const head = el("div", "modal-head", "<h3>" + escHTML(title) + "</h3>");
  const close = el("button", "modal-x", "✕");
  close.type = "button";
  close.setAttribute("aria-label", "إغلاق");
  close.addEventListener("click", closeModal);
  head.appendChild(close);

  const body = el("div", "modal-body");
  body.appendChild(node);
  box.appendChild(head);
  box.appendChild(body);
  back.addEventListener("click", closeModal);

  current = { box, back, lastFocus: document.activeElement };
  document.body.appendChild(back);
  document.body.appendChild(box);
  close.focus();
  return box;
}
