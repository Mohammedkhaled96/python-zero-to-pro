/* ============================================================================
   data/content — محتوى الوحدات وشرح أسطر الكود
   كل وحدة: ملف HTML + ملف JSON للشرح، بيتحمّلوا مع بعض ومرّة واحدة بس.
   في نسخة الملف الواحد بيتقروا من القوالب المحقونة في الصفحة.
   ============================================================================ */
import { contentURL, inlined } from "./course.js";

const html = new Map();
const notes = new Map();
const inflight = new Map();

async function fetchText(path) {
  const res = await fetch(contentURL(path));
  if (!res.ok) throw new Error("فشل تحميل " + path + " (" + res.status + ")");
  return res.text();
}

export function loadUnitContent(unit) {
  if (html.has(unit.id)) {
    return Promise.resolve({ html: html.get(unit.id), notes: notes.get(unit.id) || {} });
  }
  if (inflight.has(unit.id)) return inflight.get(unit.id);

  /* نسخة الملف الواحد: المحتوى محقون في الصفحة */
  const tpl = inlined.unit(unit.num);
  if (tpl) {
    const notesNode = inlined.notes(unit.num);
    const data = {
      html: tpl.innerHTML,
      notes: notesNode ? JSON.parse(notesNode.textContent) : {}
    };
    html.set(unit.id, data.html);
    notes.set(unit.id, data.notes);
    return Promise.resolve(data);
  }

  const job = Promise.all([
    fetchText(unit.file),
    fetchText(unit.notes).then(t => JSON.parse(t)).catch(() => ({}))
  ]).then(([unitHtml, unitNotes]) => {
    html.set(unit.id, unitHtml);
    notes.set(unit.id, unitNotes);
    inflight.delete(unit.id);
    return { html: unitHtml, notes: unitNotes };
  }).catch(err => {
    inflight.delete(unit.id);
    throw err;
  });

  inflight.set(unit.id, job);
  return job;
}

export const unitNotes = unitId => notes.get(unitId) || {};

/* تحميل استباقي هادي: بنجيب محتوى وحدة في وقت فراغ المتصفّح عشان النقرة تبقى فورية */
export function prefetchUnit(unit) {
  if (!unit || unit.loaded || html.has(unit.id) || inflight.has(unit.id)) return;
  const start = () => loadUnitContent(unit).catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 3000 });
  else setTimeout(start, 600);
}
