/**
 * TEMP runner — batch i18n (Roman Urdu → bilingual L('English', 'اردو')) edits.
 * Usage: node scripts/_i18napply.cjs _i18n_batchA.cjs
 *
 * Batch file format:
 *   module.exports = {
 *     'src/components/X.tsx': [
 *       { line: 88, find: "'Roman urdu text'", replace: "L('English', 'اردو')" },
 *     ],
 *   };
 * Rules:
 *   • `find` ka sirf EK dafa hona zaroori hai us line par.
 *   • Line number ORIGINAL file ka hai (edits descending apply hote hain).
 *   • `L` import khud add ho jata hai (src/components → '../lib/i18n').
 */
const fs = require('fs');
const path = require('path');

const batchName = process.argv[2];
if (!batchName) {
  console.error('batch file name do (e.g. _i18n_batchA.cjs)');
  process.exit(1);
}
const batch = require(path.join(__dirname, batchName));
const root = path.join(__dirname, '..');

let applied = 0;
const misses = [];

for (const [rel, rules] of Object.entries(batch)) {
  const file = path.join(root, rel);
  let raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff ? '\uFEFF' : '';
  if (bom) raw = raw.slice(1);
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(eol);

  // Line numbers batch mein purane ho sakte hain — is liye `find` ko file mein
  // dhoondte hain aur diye gaye line number ke sab se qareeb wala match lete hain.
  const locate = (r) => {
    const exact = (i) => lines[i] !== undefined && lines[i].includes(r.find);
    if (exact(r.line - 1)) return r.line - 1;
    const hits = [];
    for (let i = 0; i < lines.length; i++) if (exact(i)) hits.push(i);
    if (hits.length === 0) return -1;
    hits.sort((a, b) => Math.abs(a - (r.line - 1)) - Math.abs(b - (r.line - 1)));
    return hits[0];
  };

  const sorted = [...rules].sort((a, b) => b.line - a.line);
  for (const r of sorted) {
    const idx = locate(r);
    if (idx < 0) {
      misses.push(`${rel}:${r.line} — find kisi line par nahi mila`);
      continue;
    }
    const before = lines[idx];
    if (before.includes('L(') && /[\u0600-\u06FF]/.test(before) && before.includes(r.replace)) {
      misses.push(`${rel}:${r.line} — pehle se badla hua`);
      continue;
    }
    const hits = before.split(r.find).length - 1;
    if (hits !== 1) {
      misses.push(`${rel}:${r.line} (line ${idx + 1} par) — find ${hits} dafa mila`);
      continue;
    }
    lines[idx] = before.replace(r.find, r.replace);
    applied++;
  }

  let out = lines.join(eol);
  const importRe = /import \{([^}]*)\} from '(\.\.\/lib\/i18n|\.\/i18n)';/;
  const existing = out.match(importRe);
  if (existing) {
    if (!/(^|[\s,])L([\s,]|$)/.test(existing[1])) {
      const names = existing[1].split(',').map((s) => s.trim()).filter(Boolean);
      names.unshift('L');
      out = out.replace(importRe, `import { ${names.join(', ')} } from '${existing[2]}';`);
    }
  } else {
    const imp = rel.startsWith('src/lib/')
      ? "import { L } from './i18n';"
      : "import { L } from '../lib/i18n';";
    const m = out.match(/^import /m);
    if (m) out = out.slice(0, m.index) + imp + eol + out.slice(m.index);
    else out = imp + eol + out;
  }
  fs.writeFileSync(file, bom + out, 'utf8');
}

console.log(`APPLIED: ${applied}`);
if (misses.length) {
  console.log('MISSES:');
  for (const m of misses) console.log('  ' + m);
} else {
  console.log('MISSES: none');
}
