/* ============================================================================
   core/bus — ناقل أحداث بسيط
   الطبقات بتتكلّم مع بعضها من هنا بدل ما تستورد بعض (يمنع الاعتماد الدائري).
   الأحداث المستخدمة في المشروع:
     storage:failed      التخزين المحلّي مش شغّال
     progress:changed    التقدّم اتغيّر (درس اتعلّم، تحدّي اتحل…)
     unit:rendered       وحدة اترسمت في الصفحة
     lesson:current      الدرس اللي قدّام الطالب دلوقتي اتغيّر
     nav:go              طلب انتقال لعنصر (id)
   ============================================================================ */

const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  const set = listeners.get(event);
  if (set) set.delete(fn);
}

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach(fn => {
    try { fn(payload); }
    catch (err) { console.error("[bus]", event, err); }
  });
}
