/* ============================================================================
   tools/release — خطوة واحدة قبل أي رفع للموقع
     node tools/release.js
   بتعمل بالترتيب:
     1) تدقيق المحتوى (tools/check.js)
     2) ترقيم نسخة جديدة في sw.js  ← مهم: من غيرها الطلبة الرجّاعة هيفضلوا
        على النسخة القديمة المتخزّنة عندهم
     3) بناء نسخة الملف الواحد (dist/python-course.html)
   ============================================================================ */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const run = file => execFileSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });

/* 1) التدقيق */
run("check.js");

/* 2) رقم نسخة جديد في sw.js (تاريخ اليوم + رقم تسلسلي لو اتكرر) */
const swPath = path.join(ROOT, "sw.js");
let sw = fs.readFileSync(swPath, "utf8");
const today = new Date().toISOString().slice(0, 10);
const current = (sw.match(/const VERSION = "([^"]+)"/) || [])[1] || "";
let next = today + ".1";
if (current.indexOf(today) === 0) {
  const n = parseInt(current.split(".").pop(), 10);
  next = today + "." + (isNaN(n) ? 2 : n + 1);
}
sw = sw.replace(/const VERSION = "[^"]+"/, 'const VERSION = "' + next + '"');
fs.writeFileSync(swPath, sw, "utf8");
console.log("\n🔖 نسخة الكاش: " + (current || "—") + " ← " + next);

/* 3) نسخة الملف الواحد */
run("bundle.js");

console.log("\n✅ جاهز للرفع. ارفع كل الفولدر ما عدا tools/ (اختياري).");
