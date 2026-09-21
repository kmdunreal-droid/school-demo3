/* TEMP — mojibake fixer (UTF-8 → cp1252 mis-decode ko wapas theek karta hai).
 * Usage: node scripts/_demojibake.cjs            (dry-run, poora src)
 *        node scripts/_demojibake.cjs --write    (files ko update kare)
 */
const fs = require('fs');
const path = require('path');

const REV = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6, 0x89: 0x2030, 0x8a: 0x0160,
  0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019,
  0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a, 0x9c: 0x0153,
  0x9e: 0x017e, 0x9f: 0x0178,
};
const LOOKUP = new Map();
for (const [byte, code] of Object.entries(REV)) LOOKUP.set(code, Number(byte));
for (let b = 0xa0; b <= 0xff; b++) LOOKUP.set(b, b);

function onePass(s) {
  const bytes = [];
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code < 0x80) { bytes.push(code); continue; }
    const b = LOOKUP.get(code);
    if (b === undefined) return null; // legit non-cp1252 char (Urdu etc.) → bail
    bytes.push(b);
  }
  const fixed = Buffer.from(bytes).toString('utf8');
  if (fixed.includes('\ufffd')) return null;
  return fixed;
}

function fixLine(line) {
  let cur = line;
  for (let i = 0; i < 3; i++) {
    const next = onePass(cur);
    if (next === null || next === cur) return cur;
    cur = next;
  }
  return cur;
}

const write = process.argv.includes('--write');
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
})(path.join(__dirname, '..', 'src'));

let touched = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff ? '\uFEFF' : '';
  const body = bom ? raw.slice(1) : raw;
  const eol = body.includes('\r\n') ? '\r\n' : '\n';
  const lines = body.split(eol);
  let hits = 0;
  const fixedLines = lines.map((l) => {
    if (!/[\u00c0-\u00ff]/.test(l)) return l; // sirf mojibake-prone lines
    const f = fixLine(l);
    if (f !== l) hits++;
    return f;
  });
  if (hits > 0) {
    touched++;
    console.log(`${path.relative(path.join(__dirname, '..'), file)} — ${hits} line(s)`);
    if (write) fs.writeFileSync(file, bom + fixedLines.join(eol), 'utf8');
  }
}
console.log(`${write ? 'WRITTEN' : 'DRY-RUN'}: ${touched} file(s)`);
