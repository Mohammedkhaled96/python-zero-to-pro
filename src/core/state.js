/* ============================================================================
   core/state — تقدّم الطالب (المصدر الوحيد للحقيقة)
     done      دروس مكتملة            quiz   نتايج الاختبارات
     ch        التحدّيات               cp     نقاط التفتيش
     edits     تعديلات الكود والمدخلات  fb     رأي الطالب في الدرس
     time      وقت المذاكرة بالثواني
   أي ميزة بتقرا وتكتب من هنا بس، والحفظ في التخزين المحلّي مسؤولية الطبقة دي.
   ============================================================================ */
import { storage, KEYS } from "./storage.js";

export const state = {
  done: storage.get(KEYS.done, {}),
  quiz: storage.get(KEYS.quiz, {}),
  ch: storage.get(KEYS.ch, {}),
  cp: storage.get(KEYS.cp, {}),
  edits: storage.get(KEYS.edits, {}),
  fb: storage.get(KEYS.fb, {}),
  time: storage.get(KEYS.time, {})
};

const timers = {};

/* حفظ فوري */
export function save(name) {
  clearTimeout(timers[name]);
  delete timers[name];
  storage.set(KEYS[name], state[name]);
}

/* حفظ مؤجَّل — للكتابة المستمرّة (محرّر الكود وخانة المدخلات) */
export function saveSoon(name) {
  clearTimeout(timers[name]);
  timers[name] = setTimeout(() => save(name), 400);
}

/* قبل ما الصفحة تتقفل */
export function flushSaves() {
  Object.keys(timers).forEach(save);
}

export function replaceAll(data) {
  ["done", "quiz", "ch", "cp", "edits", "fb", "time"].forEach(name => {
    if (data[name]) {
      state[name] = data[name];
      save(name);
    }
  });
}
