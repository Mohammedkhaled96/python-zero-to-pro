/* ============================================================================
   core/storage — تخزين محلّي آمن
   لو المتصفّح مانع التخزين (تصفّح خفي / مساحة مليانة) الكورس بيفضل شغّال،
   وبنبعت حدث storage:failed مرّة واحدة عشان الواجهة تنبّه الطالب.
   ============================================================================ */
import { emit } from "./bus.js";

export const KEYS = {
  done: "py-course-done-v1",
  theme: "py-course-theme",
  last: "py-course-last-v1",
  quiz: "py-course-quiz-v1",
  ch: "py-course-challenges-v1",
  cp: "py-course-checkpoints-v1",
  edits: "py-course-edits-v1",
  fb: "py-course-feedback-v1",
  time: "py-course-time-v1"
};

let warned = false;
function failed(err) {
  if (warned) return;
  warned = true;
  console.warn("localStorage:", err);
  emit("storage:failed", err);
}

export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      if (parsed === null) return fallback;
      if (fallback !== null && typeof parsed !== typeof fallback) return fallback;
      return parsed;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { failed(e); }
  },
  raw(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setRaw(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { failed(e); }
  },
  del(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};
