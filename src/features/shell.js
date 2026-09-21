/* ============================================================================
   features/shell — واجهة الصفحة نفسها: القائمة، الثيم، زرار لفوق، الاختصارات
   ============================================================================ */
import { $, el } from "../core/dom.js";
import { storage, KEYS } from "../core/storage.js";
import { course } from "../data/course.js";
import { openModal, closeModal, isOpen } from "../ui/modal.js";
import { closeToasts } from "../ui/toast.js";
import { goTo, currentLesson } from "./navigation.js";

export function initShell() {
  const sidebar = $("#sidebar");
  const overlay = $("#overlay");
  const menuBtn = $("#menu-btn");
  const toc = $("#toc");

  menuBtn.setAttribute("aria-controls", "sidebar");
  menuBtn.setAttribute("aria-expanded", "false");

  const closeMenu = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    overlay.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      const search = $("#search");
      if (search && window.innerWidth >= 700) search.focus();
    }
  });
  overlay.addEventListener("click", closeMenu);
  toc.addEventListener("click", e => {
    if (e.target.closest("a") && window.innerWidth < 1000) closeMenu();
  });

  /* الثيم */
  const themeBtn = $("#theme-btn");
  if (storage.raw(KEYS.theme) === "light") document.documentElement.setAttribute("data-theme", "light");
  const paintTheme = () => {
    themeBtn.textContent = document.documentElement.getAttribute("data-theme") === "light" ? "☀️" : "🌙";
  };
  paintTheme();
  themeBtn.addEventListener("click", () => {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "light");
    storage.setRaw(KEYS.theme, light ? "dark" : "light");
    paintTheme();
  });

  /* زرار لفوق */
  const topBtn = $("#top-btn");
  let shown = null;
  const paintTop = () => {
    const show = window.scrollY > 700;
    if (show !== shown) { shown = show; topBtn.style.display = show ? "block" : "none"; }
  };
  window.addEventListener("scroll", paintTop, { passive: true });
  paintTop();
  topBtn.addEventListener("click", () => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  });

  /* اختصارات لوحة المفاتيح */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (isOpen()) { closeModal(); return; }
      if (sidebar.classList.contains("open")) { closeMenu(); menuBtn.focus(); }
      closeToasts();
      return;
    }
    const tag = (e.target.tagName || "").toLowerCase();
    if (e.ctrlKey || e.metaKey || e.altKey || tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    if (e.key === "/") {
      e.preventDefault();
      if (window.innerWidth < 1000 && !sidebar.classList.contains("open")) menuBtn.click();
      const search = $("#search");
      if (search) search.focus();
      return;
    }
    if (e.key === "n" || e.key === "p") {
      const lessons = course().lessons;
      const i = currentLesson() ? lessons.findIndex(l => l.id === currentLesson()) : -1;
      const target = i < 0 ? lessons[0] : lessons[e.key === "n" ? i + 1 : i - 1];
      if (target) { e.preventDefault(); goTo(target.id); }
      return;
    }
    if (e.key === "?") {
      e.preventDefault();
      openModal("اختصارات لوحة المفاتيح", el("div", "help-box",
        "<ul>" +
        "<li><kbd>/</kbd> البحث</li>" +
        "<li><kbd>n</kbd> الدرس التالي · <kbd>p</kbd> السابق</li>" +
        "<li><kbd>Ctrl</kbd>+<kbd>Enter</kbd> تشغيل الكود وإنت بتعدّله</li>" +
        "<li><kbd>Esc</kbd> إغلاق النافذة أو القائمة</li>" +
        "<li><kbd>Ctrl</kbd>+<kbd>F</kbd> بحث المتصفّح (بعد «حمّل الكورس كامل»)</li>" +
        "</ul>"));
    }
  });
}
