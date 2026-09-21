/**
 * TEMP — i18n remaining-strings scan (English + اردو).
 * node scripts/_i18nleft.cjs [fileFilter]
 * Prints remaining Roman-Urdu strings in UI files (comments excluded).
 */
const fs = require('fs');
const path = require('path');

const WORDS = [
  'nahi', 'nai', 'hoga', 'hogi', 'hua', 'hui', 'huay', 'hun', 'hoon', 'hai',
  'hain', 'jayega', 'jayegi', 'gaya', 'gayi', 'gaye', 'raha', 'rahi', 'rahe',
  'dijiye', 'chahiye', 'chahte', 'chahta', 'sakta', 'sakte', 'sakti', 'mein',
  'kyun', 'kyunke', 'aap', 'aapko', 'aapki', 'aapka', 'apna', 'apni', 'apne',
  'yeh', 'kuch', 'karo', 'kare', 'karen', 'karke', 'karne', 'karna', 'karni',
  'karain', 'karein', 'dein', 'dein', 'dena', 'deta', 'deti', 'lete', 'lekar',
  'wala', 'wali', 'wale', 'hota', 'hoti', 'hote', 'liye', 'banaya', 'banaye',
  'dikhega', 'dikhegi', 'dekho', 'dekh', 'sirf', 'phir', 'lekin', 'magar',
  'zyada', 'thora', 'turant', 'foran', 'kabhi', 'hamesha', 'rozana', 'maloom',
  'zaruri', 'zarurat', 'zaroorat', 'kaam', 'naam', 'waqt', 'tareekh', 'jama',
  'sawal', 'jawab', 'imtihan', 'parhai', 'padhai', 'taleem', 'ustaad', 'kitab',
  'likha', 'likhein', 'likhen', 'parhein', 'sunein', 'batayein', 'poochein',
  'samjhein', 'rakhein', 'rakhen', 'aane', 'jaane', 'aana', 'jaana', 'aayega',
  'jayen', 'chalein', 'chalna', 'kholen', 'kholein', 'khol', 'shuru', 'khatam',
  'mukammal', 'poora', 'pura', 'poori', 'sahi', 'galat', 'ghalat', 'theek',
  'behtar', 'achha', 'acha', 'naya', 'nayi', 'naye', 'purana', 'jaldi', 'door',
  'qareeb', 'andar', 'bahar', 'upar', 'neeche', 'aage', 'peeche', 'saath',
  'mushkil', 'asaan', 'khushi', 'afsos', 'mubarak', 'shabash', 'shukriya',
  'masla', 'masail', 'madad', 'hisaab', 'hisab', 'raqam', 'paisa', 'paise',
  'rupay', 'tanakhwah', 'kharch', 'kharcha', 'wasool', 'adaigi', 'baqa',
  'baqaya', 'udhaar', 'qarz', 'mahina', 'mahine', 'mahino', 'chhutti',
  'hazri', 'hazir', 'takhir', 'rukhsat', 'chutti', 'ijazat', 'elan', 'elaan',
  'khabar', 'sandes', 'paigham', 'talab', 'darkhwast', 'tajweez', 'mashwara',
  'zahmat', 'kharabi', 'khatra', 'sab', 'sabhi', 'tamam', 'dono', 'teeno',
  'qism', 'silsila', 'wajah', 'waja', 'nuqsan', 'faida', 'fayda', 'band',
  'khula', 'khuli', 'khul', 'chal', 'chalti', 'chalta', 'deta', 'dete',
  'milti', 'milta', 'milega', 'milegi', 'mila', 'mili', 'mile', 'kama',
  'wapis', 'wapas', 'jaisa', 'jaise', 'jaisi', 'waise', 'waisa', 'taake',
  'taky', 'kay', 'ki', 'ke', 'naam', 'lafz', 'lafzon', 'safha', 'safhe',
];

const EXCLUDE = new Set([
  'hai', 'hai', 'mein', 'kaam', 'naam', 'sab', 'dono', 'ki', 'ke', 'kay',
  'chal', 'band', 'door', 'upar', 'andar', 'bahar', 'poora', 'pura', 'kama',
  'waja', 'jala', 'sahi', 'band', 'nahi',
]);

const STRONG = [...new Set(WORDS)].filter((w) => w.length > 2 && !EXCLUDE.has(w));
const re = new RegExp('\\b(' + STRONG.join('|') + ')\\b', 'i');

const filter = process.argv[2];
const roots = ['src/App.tsx', 'src/components', 'src/lib'];
const files = [];
for (const r of roots) {
  const p = path.join(__dirname, '..', r);
  if (!fs.existsSync(p)) continue;
  const st = fs.statSync(p);
  if (st.isFile()) { files.push(p); continue; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    if (e.isFile() && /\.(tsx|ts)$/.test(e.name)) files.push(path.join(p, e.name));
  }
}

let total = 0;
const out = [];
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
  if (filter && !rel.toLowerCase().includes(filter.toLowerCase())) continue;
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  const hits = [];
  lines.forEach((ln, i) => {
    const trimmed = ln.trim();
    if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    if (trimmed.startsWith('{/*') || trimmed.startsWith('*/')) return;
    if (/\/\/[^'"`]*$/.test(trimmed) && re.test(trimmed.split('//')[0] || '')) { /* trailing comment only */ }
    if (!re.test(ln)) return;
    if (/[\u0600-\u06FF]/.test(ln)) return; // urdu side already
    if (/^\s*(export|import)\s/.test(ln)) return;
    if (/^\s*(\/\/|\*)/.test(ln)) return;
    // trailing comments: strip them for display check
    const code = ln.replace(/\/\/.*$/, '');
    if (!re.test(code)) return;
    hits.push(`  ${i + 1}: ${code.trim().slice(0, 170)}`);
  });
  if (hits.length) {
    total += hits.length;
    out.push(`\n=== ${rel}  (${hits.length}) ===`, ...hits);
  }
}
out.push(`\nTOTAL REMAINING: ${total}`);
fs.writeFileSync(path.join(__dirname, '..', '_left.txt'), out.join('\n'), 'utf8');
console.log(`TOTAL REMAINING: ${total}`);
