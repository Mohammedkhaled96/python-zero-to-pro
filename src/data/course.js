/* ============================================================================
   data/course — نموذج الكورس (وحدات ودروس) من content/course.json
   بيشتغل في الحالتين:
     • المشروع المقسّم: بيجيب الملفات بـ fetch
     • نسخة الملف الواحد: بيلاقي البيانات محقونة جوّه الصفحة
   الطبقة دي ما بتلمسش الـ DOM غير إنها تقرا البيانات المحقونة.
   ============================================================================ */

const BASE = new URL("../../content/", import.meta.url);

/* البيانات المحقونة في نسخة الملف الواحد (لو موجودة) */
export const inlined = {
  manifest: () => document.getElementById("course-manifest"),
  unit: num => document.getElementById("tpl-unit-" + num),
  notes: num => document.getElementById("notes-unit-" + num),
  search: () => document.getElementById("search-index")
};

let model = null;

export async function loadCourse() {
  if (model) return model;

  const node = inlined.manifest();
  const manifest = node
    ? JSON.parse(node.textContent)
    : await fetch(new URL("course.json", BASE)).then(res => {
        if (!res.ok) throw new Error("مش قادرين نحمّل فهرس الكورس (course.json)");
        return res.json();
      });

  const units = manifest.units.map(u => ({
    ...u,
    loaded: false,   /* اتحمّل محتواها في الصفحة؟ */
    sec: null,       /* عنصر <section> بتاعها */
    lessons: u.lessons.map(l => ({ ...l }))
  }));

  const lessons = [];
  const byId = {};
  units.forEach(u => u.lessons.forEach(l => {
    l.unit = u;
    lessons.push(l);
    byId[l.id] = l;
  }));

  model = {
    ...manifest,
    units,
    lessons,
    lesson: id => byId[id] || null,
    /* الوحدة اللي فيها معرّف معيّن: درس، أو عنوان جوّه درس (u5-l3-p2)، أو الوحدة نفسها */
    unitFor(id) {
      const direct = units.find(u => u.id === id);
      if (direct) return direct;
      const lesson = byId[id] || byId[id.replace(/-p\d+$/, "")];
      return lesson ? lesson.unit : null;
    },
    neighbours(id) {
      const i = lessons.findIndex(l => l.id === id);
      return { prev: i > 0 ? lessons[i - 1] : null, next: i >= 0 ? lessons[i + 1] || null : null };
    }
  };
  return model;
}

export function course() {
  if (!model) throw new Error("الكورس لسه ما اتحمّلش");
  return model;
}

export const contentURL = path => new URL(path, BASE);
