/* TEMP scanner — Roman-Urdu UI strings dhoond kar file:line report karta hai. */
const fs = require('fs');
const path = require('path');

const WORDS_EXTRA = [
  'hua', 'hui', 'huay', 'hun', 'hoon', 'hai', 'hain', 'ho', 'hoga', 'hogi',
  'honge', 'jayega', 'jayegi', 'gaya', 'gayi', 'gaye', 'raha', 'rahi', 'rahe',
  'diya', 'diya', 'dijiye', 'liya', 'liye', 'milta', 'milti', 'milega',
  'milegi', 'mila', 'mili', 'mile', 'chahiye', 'chahte', 'chahta', 'sakta',
  'sakte', 'sakti', 'sakoon', 'sakenge', 'mein', 'main', 'se', 'par', 'ko',
  'ka', 'ki', 'ke', 'kaun', 'kya', 'kyu', 'kyun', 'kyunke', 'aap', 'aapko',
  'apna', 'apni', 'apne', 'yeh', 'ye', 'woh', 'wo', 'is', 'us', 'inke',
  'unke', 'inka', 'unka', 'sab', 'kuch', 'kah', 'kar', 'karo', 'kare',
  'karen', 'karke', 'karne', 'karna', 'karni', 'laazim', 'lazim', 'aapka',
  'aapki', 'tamam', 'wala', 'wali', 'wale', 'hota', 'hoti', 'hote', 'hua',
  'liye', 'banaya', 'banana', 'banane', 'banaye', 'dikhega', 'dikhegi',
  'dikhe', 'dekho', 'dekh', 'sirf', 'phir', 'lekin', 'magar', 'ittefaq',
  'bus', 'bas', 'zyada', 'kam', 'thorha', 'thora', 'turant', 'foran',
  'kabhi', 'kabhe', 'hamesha', 'roz', 'rozana', 'hafta', 'maloom', 'pata',
  'ilm', 'jaankari', 'detail', 'tafseel', 'zaruri', 'zarurat', 'zaroorat',
  'amal', 'kaam', 'mahol', 'number', 'naam', 'waqt', 'samay', 'tareekh',
  'din', 'raat', 'subah', 'shaam', 'sabha', 'jama', 'jamaa', 'hasil',
  'nukta', 'sawal', 'jawab', 'imtihan', 'parhai', 'padhai', 'taleem',
  'ustaad', 'shagird', 'walid', 'walida', 'taleba', 'talbah', 'kitab',
  'safha', 'tasveer', 'likha', 'likhein', 'likhi', 'parhein', 'parhe',
  'sunein', 'bataen', 'bataein', 'batayein', 'poochein', 'samjhein',
  'rakhna', 'rakhein', 'rakhen', 'aane', 'jaane', 'aana', 'jaana', 'aayega',
  'jaye', 'jayen', 'chalein', 'chalna', 'kholen', 'kholein', 'khol',
  'band', 'shuru', 'khatam', 'khatam', 'mukammal', 'poora', 'pura', 'poori',
  'adha', 'aadha', 'nisf', 'sahi', 'galat', 'ghalat', 'theek', 'behtar',
  'behtareen', 'acha', 'achha', 'burha', 'bura', 'naya', 'nayi', 'naye',
  'purana', 'purani', 'naye', 'jaldi', 'der', 'late', 'qareeb', 'door',
  'andar', 'bahar', 'upar', 'neeche', 'aage', 'peeche', 'sath', 'saath',
  'sirf', 'mushkil', 'asaan', 'asan', 'sakoon', 'khushi', 'afsos', 'mubarak',
  'shabash', 'dua', 'shukriya', 'khuda', 'hafiz', 'salam', 'allah',
  'barae', 'baraye', 'maharbani', 'inayat', 'madad', 'masla', 'masail',
  'hal', 'jawabdeh', 'hisaab', 'hisab', 'raqam', 'paisa', 'paise', 'rupay',
  'rupaye', 'fees', 'tanakhwah', 'tankhwah', 'salary', 'kharch', 'kharcha',
  'wasool', 'wasooli', 'adaigi', 'baqa', 'baqaya', 'udhaar', 'qarz',
  'mahina', 'mahine', 'mahino', 'salanah', 'salgirah', 'chhutti', 'chhutiyan',
  'hazri', 'hazir', 'ghair', 'takhir', 'rukhsat', 'chutti', 'chhutti',
  'ijazat', 'ijazat', 'manzoori', 'inkaar', 'ita', 'ittila', 'ittila',
  'elan', 'elaan', 'notice', 'khabar', 'akhbar', 'sandes', 'paigham',
  'sawal', 'talab', 'darkhwast', 'sifarish', 'tajweez', 'mashwara',
  'tashreef', 'zahmat', 'khalal', 'kharabi', 'khatra', 'khatarnak',
];
const WORDS = [
  'karein', 'karain', 'krna', 'karna', 'karne', 'karo', 'dein', 'dena', 'deni',
  'ho gaya', 'ho gayi', 'ho ga', 'gaya hai', 'gayi hai', 'hui', 'hoga', 'hogi',
  'nahi', 'nhi', 'baqi', 'baaki', 'zaroori', 'zaruri', 'mojood', 'mojud',
  'rakh', 'lagay', 'lagayein', 'lagani', 'chalay', 'chalain', 'uthay',
  'sab se', 'sabse', 'kuch nahi', 'koi nahi', 'jaldi', 'abhi', 'khul',
  'band kar', 'chalu', 'bhej', 'bhejein', 'dekhein', 'dekhe', 'kholain',
  'add kar', 'delete kar', 'save ho', 'update ho', 'bana', 'banayein',
  'shamil', 'hata', 'wapis', 'wapas', 'pooch', 'hazri', 'tafseel', 'tafseel',
  'mahina', 'mahine', 'din baad', 'din mein', 'aaj', 'kal', 'ab', 'sirf',
  'kul', 'tamam', 'mukammal', 'theek', 'behtar', 'qareeb', 'zaroorat',
  'madad', 'masla', 'masail', 'galti', 'sahi', 'ghalat', 'jidhar', 'yahan',
  'wahan', 'is mein', 'us mein', 'ke liye', 'ke sath', 'se pehle', 'ke baad',
  'walay', 'wale', 'wali', 'wala', 'kisi bhi', 'koi bhi', 'har', 'chhota',
  'bara', 'naya', 'nayi', 'purana', 'purani', 'pehle', 'aakhri', 'aakhri',
];

const EXCLUDE = new Set([
  'is', 'us', 'se', 'par', 'ko', 'ka', 'ki', 'ke', 'ho', 'do', 'bas', 'hal',
  'kam', 'din', 'der', 'late', 'band', 'main', 'detail', 'number', 'fees',
  'notice', 'salary', 'ita', 'dua', 'salam', 'hafiz', 'nukta', 'sun', 'ab',
  'ye', 'wo', 'bus', 'par', 'bar', 'sirf',
]);

const STRONG = [...WORDS, ...WORDS_EXTRA]
  .filter((w, i, a) => a.indexOf(w) === i)
  .filter((w) => !EXCLUDE.has(w));

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
})(path.join(__dirname, '..', 'src'));

const re = new RegExp('\\b(' + STRONG.map((w) => w.replace(/ /g, '\\s+')).join('|') + ')\\b', 'i');

let total = 0;
const rows = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    const trimmed = ln.trim();
    if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    if (!re.test(ln)) return;
    // sirf woh lines jo string literal rakhti hain
    if (!/['"`]/.test(ln)) return;
    total++;
    rows.push({ f: path.relative(process.cwd(), f), n: i + 1, s: trimmed });
  });
}

const byFile = {};
for (const r of rows) {
  byFile[r.f] = byFile[r.f] || [];
  byFile[r.f].push(r);
}
const args = process.argv.slice(2);
for (const [f, list] of Object.entries(byFile)) {
  if (args.length && !args.some((a) => f.toLowerCase().includes(a.toLowerCase()))) continue;
  console.log(`\n=== ${f}  (${list.length}) ===`);
  for (const r of list) console.log(`${r.n}: ${r.s.slice(0, 200)}`);
}
console.log(`\nTOTAL: ${total}`);
