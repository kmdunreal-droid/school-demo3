/* TEMP verifier — (1) t('key') usages jo DICT mein nahi hain, (2) {var} wale keys jin mein vars pass nahi hue. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const i18nSrc = fs.readFileSync(path.join(root, 'src', 'lib', 'i18n.ts'), 'utf8');

const dict = new Map();
for (const m of i18nSrc.matchAll(/^\s*'([^']+)':\s*\[([\s\S]*?)\],\s*$/gm)) {
  const key = m[1];
  const body = m[2];
  const parts = body.match(/'((?:[^'\\]|\\.)*)'/g) || [];
  const hasVar = body.includes('{');
  dict.set(key, { parts: parts.length, hasVar });
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
})(path.join(root, 'src'));

const used = new Map(); // key -> [file:line]
let missingVars = [];

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f);

  // t('key' ...) — multiline call ka poora text bracket-count se nikalte hain
  const re = /\bt\(\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(txt))) {
    const key = m[1];
    const line = txt.slice(0, m.index).split('\n').length;
    if (!used.has(key)) used.set(key, []);
    used.get(key).push(`${rel}:${line}`);

    // call ke andar vars object hai ya nahi (key ke band hone ke baad '(' dhoond kar depth count)
    const afterKey = m.index + m[0].length;
    const openParen = txt.indexOf('(', txt.indexOf('t(', m.index) + 2);
    let args = 0;
    if (openParen > -1) {
      let depth = 0;
      for (let i = openParen; i < txt.length; i++) {
        const ch = txt[i];
        if (ch === '(' || ch === '{' || ch === '[') depth++;
        else if (ch === ')' || ch === '}' || ch === ']') {
          depth--;
          if (ch === ')' && depth === 0) break;
        } else if (ch === ',' && depth === 1) args++;
      }
    }
    const entry = dict.get(key);
    if (entry && entry.hasVar && args === 0) missingVars.push(`${rel}:${line} → '${key}' needs vars`);
    void afterKey;
  }
}

const missing = [...used.keys()].filter((k) => !dict.has(k)).sort();
const empty = [...dict.entries()].filter(([, v]) => v.parts !== 2).map(([k, v]) => `${k} (parts=${v.parts})`);
const unused = [...dict.keys()].filter((k) => !used.has(k)).sort();

console.log(`DICT keys: ${dict.size}`);
console.log(`Keys used in code: ${used.size}`);
console.log(`\n--- MISSING (code calls t(), dict mein nahi) (${missing.length}) ---`);
for (const k of missing) console.log(`  ${k}   ← ${used.get(k).slice(0, 4).join(', ')}`);
console.log(`\n--- USED KEYS (${used.size}) ---`);
for (const [k, locs] of [...used.entries()].sort()) console.log(`  ${k}   ← ${locs[0]}`);
console.log(`\n--- VAR-ARG MISSING (${missingVars.length}) ---`);
for (const x of missingVars) console.log('  ' + x);
console.log(`\n--- MALFORMED DICT ENTRIES (${empty.length}) ---`);
for (const x of empty) console.log('  ' + x);
console.log(`\n--- UNUSED DICT KEYS (${unused.length}) ---`);
console.log('  ' + unused.join(', '));
