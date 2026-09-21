/* ============================================================================
   tools/split-css — بيقسّم أنماط الصفحة القديمة لملفات بطبقاتها
     node tools/split-css.js [path/to/old-single-file.html]
   بيقرا كل قاعدة كاملة (بعدّ الأقواس) عشان ما يقطعش أي @media في نصّها.
   الترتيب في index.html لازم يبقى:
     tokens → layout → content → components → responsive   (و print بـ media="print")
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = process.argv[2] || path.resolve(ROOT, "..", "backup-single-file-index.html");
const css = fs.readFileSync(SRC, "utf8").match(/<style>([\s\S]*?)<\/style>/)[1];

/* ---------- قراءة القواعد كاملة ---------- */
const rules = [];
let i = 0;
while (i < css.length) {
  /* تعليق */
  if (css.startsWith("/*", i)) {
    const end = css.indexOf("*/", i + 2);
    rules.push({ type: "comment", text: css.slice(i, end + 2) });
    i = end + 2;
    continue;
  }
  if (/\s/.test(css[i])) { i++; continue; }

  const braceAt = css.indexOf("{", i);
  if (braceAt < 0) break;
  const selector = css.slice(i, braceAt).trim();
  let depth = 0, j = braceAt;
  for (; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}") { depth--; if (depth === 0) { j++; break; } }
  }
  rules.push({ type: "rule", selector, text: css.slice(i, j).trim() });
  i = j;
}

/* ---------- توزيع القواعد على الطبقات ---------- */
const buckets = { tokens: [], layout: [], content: [], components: [], responsive: [], print: [] };

const LAYOUT = /^(#shell|#sidebar|#side-head|#search|#progress|#toc|#main|#topbar|\.iconbtn|#menu-btn|#content|#hero|#site-footer|#top-btn|#overlay|\.side-tools|\.search-info|\.brand)/;
const CONTENT = /^(\.unit|\.lesson|\.mini-toc|\.box|\.diagram|\.cap|\.tbl-wrap|table|th|td|pre|code|\.inl|\.out|\.code|\.tk-|\.ex|\.bt|\.lvl|\.sol|strong|em|h[1-6]|blockquote|ul|ol|li|a\b)/;
const TOKENS = /^(:root|html|body|\*|::selection|html\[data-theme)/;

rules.forEach(rule => {
  if (rule.type === "comment") return;                    /* التعليقات بتتكتب مع القاعدة اللي بعدها */
  const sel = rule.selector;
  if (/^@media\s+print/.test(sel)) return buckets.print.push(rule);
  if (/^@media|^@supports/.test(sel)) return buckets.responsive.push(rule);
  if (/^@keyframes|^@font-face/.test(sel)) return buckets.components.push(rule);
  if (TOKENS.test(sel)) return buckets.tokens.push(rule);
  if (LAYOUT.test(sel)) return buckets.layout.push(rule);
  if (CONTENT.test(sel)) return buckets.content.push(rule);
  buckets.components.push(rule);
});

const HEADERS = {
  tokens: "/* المتغيّرات والثيم — كل الألوان والخطوط من هنا */",
  layout: "/* هيكل الصفحة: الشريط الجانبي، الرأس، المحتوى، التذييل */",
  content: "/* محتوى الدروس: العناوين، الصناديق، الكود، الجداول */",
  components: "/* مكوّنات تفاعلية: الاختبارات، التحدّيات، لوحة التقدّم، النوافذ */",
  responsive: "/* التجاوب: الشاشات الصغيرة وتفضيلات الحركة (بيتحمّل بعد الباقي) */",
  print: "/* الطباعة */"
};

let total = 0;
Object.keys(buckets).forEach(name => {
  const body = buckets[name].map(r => r.text).join("\n");
  const out = HEADERS[name] + "\n" + body + "\n";
  fs.writeFileSync(path.join(ROOT, "assets/css", name + ".css"), out, "utf8");
  total += buckets[name].length;
  console.log("  " + (name + ".css").padEnd(18), String(buckets[name].length).padStart(3) + " قاعدة", Math.round(Buffer.byteLength(out) / 1024) + " KB");
});
console.log("إجمالي القواعد:", total, "من", rules.filter(r => r.type === "rule").length);
